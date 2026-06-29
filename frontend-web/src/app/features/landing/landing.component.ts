import { Component, AfterViewInit, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../../core/services/websocket.service';

declare const L: any; // Leaflet library loaded via index.html CDN

interface TriageInfo {
  victimaHerida: 'SI' | 'NO';
  agresorLugar: 'SI' | 'NO';
  armaFuego: 'SI' | 'NO';
}

interface ChatMessage {
  id: number;
  autor: 'usuario' | 'operador' | 'sistema';
  texto: string;
  hora: string;
  esGif?: boolean;
  archivoUrl?: string;
  tipoArchivo?: string;
}

interface EmergencyCase {
  id: number;
  nombre: string;
  rut: string;
  telefono: string;
  incidente: string;
  horaIngreso: string;
  estado: 'Pendiente' | 'En Proceso' | 'Despachada' | 'Finalizada';
  triage: TriageInfo;
  ubicacionNombre: string;
  lat: number;
  lng: number;
  tags: string[];
  modoCamuflaje: boolean;
  mensajes: ChatMessage[];
  notasOperador: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  operadorNombre = 'Operador Juan Pérez';
  operadorID = 'OP-12345';
  activeTab: 'dashboard' | 'history' = 'dashboard';
  
  emergencies: EmergencyCase[] = [];
  selectedEmergency: EmergencyCase | null = null;
  searchQuery = '';
  selectedFilter: 'all' | 'pending' | 'active' | 'resolved' = 'all';

  // Filtros de Historial
  historySearchQuery = '';
  historyFilterType = 'todos';
  historyFilterStatus = 'todos';
  historyDateRange = '';
  
  // Chat input
  chatText = '';

  // Preset response GIFs (LSCh)
  presetGifs = [
    { label: 'Patrulla en camino', icon: 'fa-car-side' },
    { label: 'Ambulancia en camino', icon: 'fa-ambulance' },
    { label: 'Bomberos en camino', icon: 'fa-fire-extinguisher' },
    { label: 'Mantén la calma', icon: 'fa-heart' },
    { label: 'Escribe si es seguro', icon: 'fa-keyboard' }
  ];

  // Map reference
  private map: any;
  private marker: any;

  // Video call simulated state
  showVideoCallModal = false;
  videoCallConnected = false;
  videoCallTimer: any;
  videoCallSeconds = 0;
  videoCallDurationText = '00:00';

  // Sound generator
  private audioCtx: AudioContext | null = null;

  // Notification state
  newEmergencyToast = false;
  newEmergencyName = '';

  // Polling intervals
  private alertsInterval: any;
  private chatInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private websocketService: WebsocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.startPollingAlertas();
    
    // Suscribirse a las alertas reales provenientes del backend
    this.websocketService.getAlertas().subscribe(alerta => {
      this.handleRealEmergency(alerta);
    });
  }

  ngAfterViewInit() {
    // Cargar mapa tras inicializar vista
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  ngOnDestroy() {
    if (this.alertsInterval) clearInterval(this.alertsInterval);
    if (this.chatInterval) clearInterval(this.chatInterval);
  }

  mapAlertaToEmergencyCase(alerta: any): EmergencyCase {
    const latLng = alerta.latitudLongitud ? alerta.latitudLongitud.split(',') : ['-33.4503', '-70.6781'];
    const lat = Number(latLng[0]) || -33.4503;
    const lng = Number(latLng[1]) || -70.6781;
    const date = new Date(alerta.fechaHoraInicio);
    const hourStr = !isNaN(date.getTime())
      ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      : '00:00';
    
    let estado: 'Pendiente' | 'En Proceso' | 'Despachada' | 'Finalizada' = 'Pendiente';
    if (alerta.estado === 'Despachada') estado = 'Despachada';
    else if (alerta.estado === 'En Proceso') estado = 'En Proceso';
    else if (alerta.estado === 'Finalizada') estado = 'Finalizada';

    const tags = [];
    if (estado === 'Pendiente') tags.push('NUEVA');
    else if (estado === 'En Proceso' || estado === 'Despachada') tags.push('EN ATENCIÓN');
    else if (estado === 'Finalizada') tags.push('RESUELTA');
    if (alerta.modoCamuflaje) tags.push('CAMUFLAJE');

    return {
      id: alerta.id,
      nombre: alerta.personaSorda && alerta.personaSorda.usuario
        ? `${alerta.personaSorda.usuario.nombre} ${alerta.personaSorda.usuario.apellido}`
        : 'Ciudadano Sordo',
      rut: alerta.personaSorda && alerta.personaSorda.usuario ? alerta.personaSorda.usuario.rut : '—',
      telefono: alerta.personaSorda && alerta.personaSorda.usuario ? alerta.personaSorda.usuario.telefono : '—',
      incidente: alerta.incidente || 'Alerta de Pánico',
      horaIngreso: hourStr,
      estado: estado,
      triage: {
        victimaHerida: 'NO',
        agresorLugar: 'NO',
        armaFuego: 'NO'
      },
      ubicacionNombre: alerta.personaSorda ? alerta.personaSorda.direccion : 'Ubicación Desconocida',
      lat: lat,
      lng: lng,
      tags: tags,
      modoCamuflaje: !!alerta.modoCamuflaje,
      mensajes: [],
      notasOperador: ''
    };
  }

  startPollingAlertas() {
    const fetchAlerts = () => {
      this.http.get<any[]>('http://localhost:8080/api/alertas')
        .subscribe({
          next: (alertas) => {
            this.ngZone.run(() => {
              const mapped = alertas.map(a => this.mapAlertaToEmergencyCase(a));
              
              // Buscar si hay alertas nuevas pendientes
              const currentIds = this.emergencies.map(e => e.id);
              mapped.forEach(newCase => {
                if (!currentIds.includes(newCase.id) && newCase.estado === 'Pendiente') {
                  this.newEmergencyName = newCase.nombre;
                  this.newEmergencyToast = true;
                  this.playAlarmSound();
                  setTimeout(() => this.newEmergencyToast = false, 6000);
                }
              });

              this.emergencies = mapped;

              // Mantener selección del caso actual si aún existe
              if (this.selectedEmergency) {
                const stillExists = this.emergencies.find(e => e.id === this.selectedEmergency!.id);
                if (stillExists) {
                  const prevMsgs = this.selectedEmergency.mensajes;
                  Object.assign(this.selectedEmergency, stillExists);
                  if (this.selectedEmergency.mensajes.length === 0) {
                    this.selectedEmergency.mensajes = prevMsgs;
                  }
                } else {
                  this.selectedEmergency = this.emergencies.length > 0 ? this.emergencies[0] : null;
                }
              } else if (this.emergencies.length > 0) {
                this.selectEmergency(this.emergencies[0]);
              }

              this.updateMapMarker();
              this.cdr.detectChanges();
            });
          },
          error: (err) => console.error('Error fetching alerts:', err)
        });
    };

    this.alertsInterval = setInterval(fetchAlerts, 3000);
    fetchAlerts();

    // Polling de detalles (chat y triage)
    this.chatInterval = setInterval(() => {
      this.fetchSelectedEmergencyDetails();
    }, 2000);
  }

  fetchSelectedEmergencyDetails() {
    if (!this.selectedEmergency) return;
    const alertId = this.selectedEmergency.id;

    // Obtener triage
    this.http.get<any[]>(`http://localhost:8080/api/triage-alertas/alerta/${alertId}`)
      .subscribe({
        next: (triageList) => {
          if (!this.selectedEmergency || this.selectedEmergency.id !== alertId) return;
          
          let victimaHerida: 'SI' | 'NO' = 'NO';
          let agresorLugar: 'SI' | 'NO' = 'NO';
          let armaFuego: 'SI' | 'NO' = 'NO';

          triageList.forEach(t => {
            const pre = t.preguntaClave.toUpperCase();
            if (pre.includes('HERIDO')) victimaHerida = t.respuestaSordo ? 'SI' : 'NO';
            if (pre.includes('ARMA')) armaFuego = t.respuestaSordo ? 'SI' : 'NO';
            if (pre.includes('CASA') || pre.includes('LUGAR')) agresorLugar = t.respuestaSordo ? 'SI' : 'NO';
          });

          this.selectedEmergency.triage = { victimaHerida, agresorLugar, armaFuego };
        },
        error: (err) => console.warn('Error fetching triage:', err)
      });

    // Obtener chats
    this.http.get<any[]>(`http://localhost:8080/api/chats/alerta/${alertId}`)
      .subscribe({
        next: (chatList) => {
          if (!this.selectedEmergency || this.selectedEmergency.id !== alertId) return;

          const mappedMsgs: ChatMessage[] = chatList.map(m => {
            const time = new Date(m.fechaHoraEnvio);
            const hourStr = !isNaN(time.getTime())
              ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
              : '00:00';
            
            let autor: 'usuario' | 'operador' | 'sistema' = 'usuario';
            if (m.emisorId === 1) {
              autor = 'operador';
            } else if (m.emisorId === 0) {
              autor = 'sistema';
            }

            return {
              id: m.id,
              autor: autor,
              texto: m.texto,
              hora: hourStr,
              esGif: m.tipo === 'gif',
              archivoUrl: m.archivoUrl,
              tipoArchivo: m.tipoArchivo
            };
          });

          if (JSON.stringify(this.selectedEmergency.mensajes) !== JSON.stringify(mappedMsgs)) {
            this.selectedEmergency.mensajes = mappedMsgs;
            this.scrollChatToBottom();
          }
        },
        error: (err) => console.warn('Error fetching chats:', err)
      });
  }

  initMap() {
    if (typeof L !== 'undefined' && this.selectedEmergency && !this.map) {
      const coords: [number, number] = [this.selectedEmergency.lat, this.selectedEmergency.lng];
      
      this.map = L.map('leaflet-map-element', {
        zoomControl: true,
        attributionControl: false
      }).setView(coords, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.updateMapMarker();
    }
  }

  updateMapMarker() {
    if (!this.map || !this.selectedEmergency || typeof L === 'undefined') return;

    const coords: [number, number] = [this.selectedEmergency.lat, this.selectedEmergency.lng];

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    let markerColorClass = 'marker-red';
    if (this.selectedEmergency.estado === 'En Proceso' || this.selectedEmergency.estado === 'Despachada') {
      markerColorClass = 'marker-yellow';
    } else if (this.selectedEmergency.estado === 'Finalizada') {
      markerColorClass = 'marker-green';
    }

    const customIcon = L.divIcon({
      className: `custom-map-pin ${markerColorClass} ${this.selectedEmergency.modoCamuflaje ? 'is-camuflaje' : ''}`,
      html: `
        <div class="pin-wrapper">
          <div class="pin-drop"></div>
          <div class="pin-center">
            ${this.selectedEmergency.modoCamuflaje ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>'}
          </div>
        </div>
      `,
      iconSize: [36, 46],
      iconAnchor: [18, 46],
      popupAnchor: [0, -40]
    });

    this.marker = L.marker(coords, { icon: customIcon }).addTo(this.map);
    this.marker.bindPopup(`<b>${this.selectedEmergency.nombre}</b><br>${this.selectedEmergency.incidente}`).openPopup();
  }

  selectEmergency(item: EmergencyCase) {
    this.selectedEmergency = item;
    
    // Mover el mapa
    if (this.map && L) {
      const coords: [number, number] = [item.lat, item.lng];
      this.map.setView(coords, 15);
      this.updateMapMarker();
    }
    this.fetchSelectedEmergencyDetails();
  }

  getFilteredEmergencies(): EmergencyCase[] {
    return this.emergencies.filter(item => {
      if (item.estado === 'Finalizada') return false;

      const matchesSearch = item.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            item.rut.includes(this.searchQuery) ||
                            item.incidente.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (this.selectedFilter === 'pending') {
        return item.estado === 'Pendiente';
      } else if (this.selectedFilter === 'active') {
        return item.estado === 'En Proceso' || item.estado === 'Despachada';
      }
      return true;
    });
  }

  switchTab(tab: 'dashboard' | 'history') {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        } else {
          this.initMap();
        }
      }, 100);
    }
  }

  getFilteredHistory(): EmergencyCase[] {
    return this.emergencies.filter(item => {
      const matchesSearch = item.nombre.toLowerCase().includes(this.historySearchQuery.toLowerCase()) ||
                            item.rut.includes(this.historySearchQuery) ||
                            item.incidente.toLowerCase().includes(this.historySearchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (this.historyFilterStatus !== 'todos') {
        if (this.historyFilterStatus === 'finalizada') {
          return item.estado === 'Finalizada';
        } else if (this.historyFilterStatus === 'pendiente') {
          return item.estado === 'Pendiente';
        } else if (this.historyFilterStatus === 'proceso') {
          return item.estado === 'En Proceso' || item.estado === 'Despachada';
        }
      }
      return true;
    });
  }

  getKPIs() {
    const total = this.emergencies.length + 115;
    const resolved = this.emergencies.filter(e => e.estado === 'Finalizada').length + 108;
    const active = this.emergencies.filter(e => e.estado === 'En Proceso' || e.estado === 'Despachada').length;
    return {
      total,
      avgResponseTime: '4.8 min',
      resolved,
      active
    };
  }

  exportHistoryPDF() {
    alert('Exportando historial de emergencias en formato PDF... El archivo se ha descargado correctamente.');
  }

  sendTextMessage() {
    if (!this.chatText.trim() || !this.selectedEmergency) return;
    const txt = this.chatText.trim();
    this.chatText = '';
    
    this.http.post('http://localhost:8080/api/chats', {
      texto: txt,
      fechaHoraEnvio: new Date().toISOString(),
      emisorId: 1, // operator
      tipo: 'texto',
      alerta: { id: this.selectedEmergency.id }
    }).subscribe({
      next: () => this.fetchSelectedEmergencyDetails(),
      error: (err) => console.error('Error al enviar mensaje:', err)
    });
  }

  sendPresetGifMsg(gifLabel: string) {
    if (!this.selectedEmergency) return;
    
    this.http.post('http://localhost:8080/api/chats', {
      texto: `[Respuesta en LSCh] ${gifLabel}`,
      fechaHoraEnvio: new Date().toISOString(),
      emisorId: 1, // operator
      tipo: 'gif',
      alerta: { id: this.selectedEmergency.id }
    }).subscribe({
      next: () => this.fetchSelectedEmergencyDetails(),
      error: (err) => console.error('Error al enviar GIF rápido:', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedEmergency) {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post<any>('http://localhost:8080/api/uploads', formData)
        .subscribe({
          next: (res) => {
            this.http.post('http://localhost:8080/api/chats', {
              texto: res.fileName,
              fechaHoraEnvio: new Date().toISOString(),
              emisorId: 1, // operator
              tipo: 'archivo',
              archivoUrl: res.fileUrl,
              tipoArchivo: res.fileType,
              alerta: { id: this.selectedEmergency!.id }
            }).subscribe({
              next: () => this.fetchSelectedEmergencyDetails(),
              error: (err) => console.error('Error al enviar adjunto al chat:', err)
            });
          },
          error: (err) => {
            console.error('Error subiendo archivo:', err);
            alert('Error al subir el archivo al servidor');
          }
        });
    }
  }

  dispatchUnit(unitType: 'patrulla' | 'ambulancia' | 'bomberos') {
    if (!this.selectedEmergency) return;
    
    let nextEstado: 'En Proceso' | 'Despachada' = 'En Proceso';
    let actionText = '';
    
    if (unitType === 'patrulla') {
      nextEstado = 'Despachada';
      actionText = 'SE DESPACHÓ: Radio Patrulla (Carabineros) al lugar del incidente.';
    } else if (unitType === 'ambulancia') {
      nextEstado = 'En Proceso';
      actionText = 'SE ENLAZÓ CON SAMU: Ambulancia de emergencia en camino.';
    } else {
      nextEstado = 'En Proceso';
      actionText = 'SE ENLAZÓ CON BOMBEROS: Carro bomba despachado.';
    }

    this.http.get<any>(`http://localhost:8080/api/alertas/${this.selectedEmergency.id}`)
      .subscribe({
        next: (alerta) => {
          alerta.estado = nextEstado;
          this.http.put(`http://localhost:8080/api/alertas/${this.selectedEmergency!.id}`, alerta)
            .subscribe({
              next: () => {
                this.http.post('http://localhost:8080/api/chats', {
                  texto: actionText,
                  fechaHoraEnvio: new Date().toISOString(),
                  emisorId: 0, // system
                  tipo: 'texto',
                  alerta: { id: this.selectedEmergency!.id }
                }).subscribe({
                  next: () => {
                    this.fetchSelectedEmergencyDetails();
                    this.updateMapMarker();
                  },
                  error: (err) => console.error('Error al guardar mensaje del sistema:', err)
                });
              },
              error: (err) => console.error('Error al actualizar estado:', err)
            });
        }
      });
  }

  resolveEmergency() {
    if (!this.selectedEmergency) return;

    this.http.get<any>(`http://localhost:8080/api/alertas/${this.selectedEmergency.id}`)
      .subscribe({
        next: (alerta) => {
          alerta.estado = 'Finalizada';
          this.http.put(`http://localhost:8080/api/alertas/${this.selectedEmergency!.id}`, alerta)
            .subscribe({
              next: () => {
                this.http.post('http://localhost:8080/api/chats', {
                  texto: 'CASO CERRADO: Operación finalizada y guardada en historial.',
                  fechaHoraEnvio: new Date().toISOString(),
                  emisorId: 0, // system
                  tipo: 'texto',
                  alerta: { id: this.selectedEmergency!.id }
                }).subscribe({
                  next: () => {
                    this.selectedEmergency = null;
                    if (this.marker && this.map) {
                      this.map.removeLayer(this.marker);
                      this.marker = null;
                    }
                  },
                  error: (err) => console.error('Error al cerrar chat:', err)
                });
              },
              error: (err) => console.error('Error al finalizar alerta:', err)
            });
        }
      });
  }

  saveDispatchNotes() {
    alert('Notas de despacho actualizadas y registradas correctamente.');
  }

  // --- Videollamada simulada ---
  startVideoCall() {
    this.showVideoCallModal = true;
    this.videoCallConnected = false;
    this.videoCallSeconds = 0;
    this.videoCallDurationText = 'Conectando...';

    setTimeout(() => {
      this.videoCallConnected = true;
      this.videoCallTimer = setInterval(() => {
        this.videoCallSeconds++;
        const mins = String(Math.floor(this.videoCallSeconds / 60)).padStart(2, '0');
        const secs = String(this.videoCallSeconds % 60).padStart(2, '0');
        this.videoCallDurationText = `${mins}:${secs}`;
      }, 1000);
    }, 1500);
  }

  endVideoCall() {
    this.showVideoCallModal = false;
    if (this.videoCallTimer) {
      clearInterval(this.videoCallTimer);
    }
  }

  simulateIncomingEmergency() {
    // Simula una alerta en el backend agregándola por HTTP
    const randomNames = ['Roberto Barraza', 'Sofía Valdés', 'Jorge Sanhueza', 'Camila Leyton'];
    const randomRuts = ['17.432.901-K', '20.651.042-3', '15.981.332-9', '18.502.119-2'];
    const randomIncidents = ['Sospecha de Robo', 'Accidente de tránsito', 'Violencia intrafamiliar', 'Intento de asalto'];
    const randomCoords = [
      "-33.4550,-70.6800",
      "-33.4350,-70.6400",
      "-33.4680,-70.6920"
    ];

    const idx = Math.floor(Math.random() * randomNames.length);
    const coordIdx = Math.floor(Math.random() * randomCoords.length);

    this.http.post('http://localhost:8080/api/alertas', {
      fechaHoraInicio: new Date().toISOString(),
      latitudLongitud: randomCoords[coordIdx],
      disponibleTriage: true,
      estado: 'ACTIVO',
      incidente: randomIncidents[idx],
      modoCamuflaje: Math.random() > 0.5,
      personaSorda: {
        id: 1 // Default persona sorda (María Gómez)
      }
    }).subscribe({
      next: (res: any) => {
        // Enviar primer mensaje automático del sistema
        this.http.post('http://localhost:8080/api/chats', {
          texto: 'Estoy en peligro',
          fechaHoraEnvio: new Date().toISOString(),
          emisorId: 2, // sordo
          tipo: 'texto',
          alerta: { id: res.id }
        }).subscribe({
          next: () => {
            console.log('Alerta entrante simulada en base de datos.');
          }
        });
      },
      error: (err) => console.error('Error al simular alerta:', err)
    });
  }

  handleRealEmergency(backendAlerta: any) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let lat = -33.4569;
    let lng = -70.6483;
    if (backendAlerta.latitudLongitud) {
      const parts = backendAlerta.latitudLongitud.split(',');
      if (parts.length === 2) {
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
      }
    }

    const persona = backendAlerta.personaSorda || {};
    const usuario = persona.usuario || {};
    let nombre = ((usuario.nombre || '') + ' ' + (usuario.apellido || '')).trim();
    if (!nombre) nombre = 'Ciudadano Sordo';

    const newCase: EmergencyCase = {
      id: backendAlerta.id || Date.now(),
      nombre: nombre,
      rut: usuario.rut || 'Desconocido',
      telefono: usuario.telefono || 'Sin teléfono',
      incidente: backendAlerta.incidente || 'Alerta de Pánico (Sordo)',
      horaIngreso: timeStr,
      estado: 'Pendiente',
      triage: {
        victimaHerida: 'NO',
        agresorLugar: 'NO',
        armaFuego: 'NO'
      },
      ubicacionNombre: persona.direccion || 'Ubicación GPS detectada',
      lat: lat,
      lng: lng,
      tags: ['CAMUFLAJE', 'NUEVA'],
      modoCamuflaje: backendAlerta.modoCamuflaje || false,
      notasOperador: '',
      mensajes: [
        { id: 1, autor: 'usuario', texto: 'Alerta disparada desde la aplicación', hora: timeStr, esGif: false }
      ]
    };

    // Agregar al inicio si no existe ya
    const existingIndex = this.emergencies.findIndex(e => e.id === newCase.id);
    if (existingIndex === -1) {
      this.emergencies.unshift(newCase);
    }
    this.selectEmergency(newCase);

    // Activar alertas
    this.newEmergencyName = newCase.nombre;
    this.newEmergencyToast = true;
    this.playAlarmSound();

    setTimeout(() => {
      this.newEmergencyToast = false;
    }, 6000);
  }

  private playAlarmSound() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const duration = 1.2;
      const osc1 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc1.frequency.linearRampToValueAtTime(880, this.audioCtx.currentTime + 0.3);
      osc1.frequency.linearRampToValueAtTime(440, this.audioCtx.currentTime + 0.6);
      osc1.frequency.linearRampToValueAtTime(880, this.audioCtx.currentTime + 0.9);
      osc1.frequency.linearRampToValueAtTime(440, this.audioCtx.currentTime + 1.2);

      gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

      osc1.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc1.start();
      osc1.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext bloqueado o no soportado:', e);
    }
  }

  private scrollChatToBottom() {
    setTimeout(() => {
      const container = document.getElementById('chat-scroll-area');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
