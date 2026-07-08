import { Component, AfterViewInit, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../../core/services/websocket.service';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare const L: any; // Leaflet library loaded via index.html CDN
import { Client } from '@stomp/stompjs';

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
  horaFin?: string;
  estado: 'Pendiente' | 'En Proceso' | 'Despachada' | 'Finalizada';
  triage: TriageInfo;
  ubicacionNombre: string;
  lat: number;
  lng: number;
  disponibleTriage: boolean;
  tags: string[];
  modoCamuflaje: boolean;
  mensajes: ChatMessage[];
  notasOperador: string;
  infoMedica: string;
  nombreReferenciaCasa?: string;
  latCasa?: number;
  lngCasa?: number;
  entornos?: any[];
  contactosEmergencia?: any[];
  patrullaInfo?: {
    patente: string;
    estado: string;
    eta?: string;
  };
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  operadorNombre = '';
  operadorID = '';
  activeTab: 'dashboard' | 'history' | 'validations' = 'dashboard';
  
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
    { label: '🚓 PATRULLA YA VA. ESPERA.', icon: 'fa-car-side' },
    { label: '❤️ CALMA. TÚ TRANQUILO.', icon: 'fa-heart' },
    { label: '⌨️ SI SEGURO, TÚ ESCRIBIR.', icon: 'fa-keyboard' },
    { label: '📍 TÚ ¿DÓNDE ESTÁS?', icon: 'fa-location-dot' }
  ];

  // Map reference
  private map: any;
  private marker: any;
  private homeMarker: any;
  private patrolMarker: any;
  private patrolLine: any;
  private patrolInterval: any;
  private dispatchStarts: { [id: number]: number } = {};
  private patrolRoutes: { [id: number]: [number, number][] } = {};
  private patrolRouteFetching: { [id: number]: boolean } = {};
  private readonly ETA_TOTAL_SEG = 360; // 6 min (debe coincidir con el móvil)

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

  // Reverse geocoding for active emergency
  selectedEmergencyStreet = '';
  selectedEmergencyHomeStreet = '';
  showFullAlertAddress = false;
  showFullHomeAddress = false;

  // Validation State
  pendingUsers: any[] = [];
  validationPollingInterval: any;

  // Polling intervals
  private alertsInterval: any;
  private chatInterval: any;

  // Video call
  videoCallUrl: SafeResourceUrl | null = null;
  isVideoCallActive = false;
  isCalling = false;
  isReceivingCall = false;
  private peerConnection: RTCPeerConnection | null = null;
  private webrtcStompClient: Client | null = null;
  private localStream: MediaStream | null = null;

  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private websocketService: WebsocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.operadorNombre = 'Operador ' + this.authService.getUserName();
    this.operadorID = this.authService.getUserRut();
    
    this.startPollingAlertas();
    this.patrolInterval = setInterval(() => this.updatePatrolMarker(), 1000);
    
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
    this.startPollingValidations();
  }

  startPollingValidations() {
    const fetchValidations = () => {
      this.http.get<any[]>(`${environment.apiUrl}/usuarios/pendientes`)
        .subscribe({
          next: (usuarios) => {
            this.ngZone.run(() => {
              if (usuarios.length > 0) {
                usuarios.forEach(u => {
                  const exists = this.pendingUsers.find(p => p.id === u.id);
                  if (!exists) {
                    this.http.get<any>(`${environment.apiUrl}/api/personas-sordas/usuario/${u.rut}`).subscribe({
                      next: (ps) => {
                        u.documentoValidacionUrl = ps.documentoValidacionUrl;
                        this.pendingUsers.push(u);
                        this.cdr.detectChanges();
                      },
                      error: () => {
                        this.pendingUsers.push(u);
                        this.cdr.detectChanges();
                      }
                    });
                  }
                });
                
                // Limpiar usuarios que ya no están pendientes
                this.pendingUsers = this.pendingUsers.filter(p => usuarios.find(u => u.id === p.id));
              } else {
                this.pendingUsers = [];
              }
              this.cdr.detectChanges();
            });
          },
          error: (err) => console.warn('Error fetching pendientes:', err)
        });
    };
    this.validationPollingInterval = setInterval(fetchValidations, 5000);
    fetchValidations();
  }

  ngOnDestroy() {
    if (this.alertsInterval) clearInterval(this.alertsInterval);
    if (this.chatInterval) clearInterval(this.chatInterval);
    if (this.patrolInterval) clearInterval(this.patrolInterval);
    if (this.validationPollingInterval) clearInterval(this.validationPollingInterval);
  }

  mapAlertaToEmergencyCase(alerta: any): EmergencyCase {
    const latLng = alerta.latitudLongitud ? alerta.latitudLongitud.split(',') : ['-33.4503', '-70.6781'];
    const lat = Number(latLng[0]) || -33.4503;
    const lng = Number(latLng[1]) || -70.6781;
    let hourStr = '00:00';
    if (alerta.fechaHoraInicio && alerta.fechaHoraInicio.includes('T')) {
      const parts = alerta.fechaHoraInicio.split('T');
      const dateParts = parts[0].split('-');
      if (dateParts.length === 3) {
        hourStr = `${dateParts[2]}/${dateParts[1]} ${parts[1].substring(0, 5)}`;
      } else {
        hourStr = alerta.fechaHoraInicio.substring(11, 16);
      }
    }

    let hourFinStr: string | undefined = undefined;
    if (alerta.fechaHoraFin && alerta.fechaHoraFin.includes('T')) {
      const parts = alerta.fechaHoraFin.split('T');
      const dateParts = parts[0].split('-');
      if (dateParts.length === 3) {
        hourFinStr = `${dateParts[2]}/${dateParts[1]} ${parts[1].substring(0, 5)}`;
      } else {
        hourFinStr = alerta.fechaHoraFin.substring(11, 16);
      }
    }
    
    let estado: 'Pendiente' | 'En Proceso' | 'Despachada' | 'Finalizada' = 'Pendiente';
    if (alerta.estado === 'Despachada') estado = 'Despachada';
    else if (alerta.estado === 'En Proceso') estado = 'En Proceso';
    else if (alerta.estado === 'Finalizada') estado = 'Finalizada';

    const tags = [];
    if (estado === 'Pendiente') tags.push('NUEVA');
    else if (estado === 'En Proceso' || estado === 'Despachada') tags.push('EN ATENCIÓN');
    else if (estado === 'Finalizada') tags.push('RESUELTA');

    return {
      id: alerta.id,
      nombre: alerta.personaSorda && alerta.personaSorda.usuario
        ? `${alerta.personaSorda.usuario.nombre} ${alerta.personaSorda.usuario.apellido}`
        : 'Ciudadano Sordo',
      rut: alerta.personaSorda && alerta.personaSorda.usuario ? alerta.personaSorda.usuario.rut : '—',
      telefono: alerta.personaSorda && alerta.personaSorda.usuario ? alerta.personaSorda.usuario.telefono : '—',
      incidente: alerta.incidente || 'Alerta de Pánico',
      horaIngreso: hourStr,
      horaFin: hourFinStr,
      estado: estado,
      triage: {
        victimaHerida: 'NO',
        agresorLugar: 'NO',
        armaFuego: 'NO'
      },
      ubicacionNombre: alerta.personaSorda ? alerta.personaSorda.direccion : 'Ubicación Desconocida',
      lat: lat,
      lng: lng,
      disponibleTriage: alerta.disponibleTriage !== undefined ? alerta.disponibleTriage : true,
      tags: tags,
      modoCamuflaje: !!alerta.modoCamuflaje,
      mensajes: [],
      notasOperador: alerta.notasOperador || '',
      infoMedica: alerta.personaSorda ? alerta.personaSorda.infoMedica : 'Sin información médica registrada',
      nombreReferenciaCasa: alerta.personaSorda ? alerta.personaSorda.nombreReferenciaCasa : undefined,
      latCasa: alerta.personaSorda ? alerta.personaSorda.latitudCasa : undefined,
      lngCasa: alerta.personaSorda ? alerta.personaSorda.longitudCasa : undefined
    };
  }

  startPollingAlertas() {
    const fetchAlerts = () => {
      this.http.get<any[]>(`${environment.apiUrl}/api/alertas`)
        .subscribe({
          next: (alertas) => {
            this.ngZone.run(() => {
              const mapped = alertas.map(a => this.mapAlertaToEmergencyCase(a)).reverse();
              
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

              // Mantener selección del caso actual si aún existe y NO está finalizada
              if (this.selectedEmergency) {
                const stillExists = this.emergencies.find(e => e.id === this.selectedEmergency!.id);
                if (stillExists && stillExists.estado !== 'Finalizada') {
                  const prevMsgs = this.selectedEmergency.mensajes;
                  const prevTriage = this.selectedEmergency.triage;
                  const prevNotas = this.selectedEmergency.notasOperador;
                  Object.assign(this.selectedEmergency, stillExists);
                  if (this.selectedEmergency.mensajes.length === 0) {
                    this.selectedEmergency.mensajes = prevMsgs;
                  }
                  this.selectedEmergency.triage = prevTriage;
                  this.selectedEmergency.notasOperador = prevNotas;
                } else {
                  this.clearActiveEmergency();
                  const activeEmergencies = this.getFilteredEmergencies();
                  if (activeEmergencies.length > 0) {
                    this.selectEmergency(activeEmergencies[0]);
                  }
                }
              } else {
                const activeEmergencies = this.getFilteredEmergencies();
                if (activeEmergencies.length > 0) {
                  this.selectEmergency(activeEmergencies[0]);
                }
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
    this.http.get<any[]>(`${environment.apiUrl}/api/triage-alertas/alerta/${alertId}`)
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
          this.cdr.detectChanges();
        },
        error: (err) => console.warn('Error fetching triage:', err)
      });

    // Obtener entornos
    this.http.get<any[]>(`${environment.apiUrl}/api/entornos/usuario/${this.selectedEmergency.rut}`)
      .subscribe({
        next: (entornos) => {
          if (!this.selectedEmergency || this.selectedEmergency.id !== alertId) return;
          this.selectedEmergency.entornos = entornos;
          this.cdr.detectChanges();
        },
        error: (err) => console.warn('Error fetching entornos:', err)
      });

    // Obtener contactos
    this.http.get<any[]>(`${environment.apiUrl}/api/contactos-emergencia/usuario/${this.selectedEmergency.rut}`)
      .subscribe({
        next: (contactos) => {
          if (!this.selectedEmergency || this.selectedEmergency.id !== alertId) return;
          this.selectedEmergency.contactosEmergencia = contactos;
          this.cdr.detectChanges();
        },
        error: (err) => console.warn('Error fetching contactos:', err)
      });

    // Obtener chats
    this.http.get<any[]>(`${environment.apiUrl}/api/chats/alerta/${alertId}`)
      .subscribe({
        next: (chatList) => {
          if (!this.selectedEmergency || this.selectedEmergency.id !== alertId) return;

          const mappedMsgs: ChatMessage[] = chatList.map(m => {
            let hourStr = '00:00';
            if (m.fechaHoraEnvio && m.fechaHoraEnvio.includes('T')) {
              hourStr = m.fechaHoraEnvio.substring(11, 16);
            }
            
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

    let colorHex = '#ef4444'; // Red (Pendiente)
    if (this.selectedEmergency.estado === 'En Proceso' || this.selectedEmergency.estado === 'Despachada') {
      colorHex = '#f59e0b'; // Yellow
    } else if (this.selectedEmergency.estado === 'Finalizada') {
      colorHex = '#10b981'; // Green
    }

    const rgbaColor = colorHex === '#ef4444' ? 'rgba(239,68,68,.5)' : colorHex === '#f59e0b' ? 'rgba(245,158,11,.5)' : 'rgba(16,185,129,.5)';

    const customIcon = L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;border-radius:50%;background:${colorHex};border:3px solid #fff;box-shadow:0 0 0 4px ${rgbaColor}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });

    this.marker = L.marker(coords, { icon: customIcon }).addTo(this.map);
    this.marker.bindPopup(`<b>${this.selectedEmergency.nombre}</b><br>${this.selectedEmergency.incidente}`).openPopup();

    // Home Marker
    if (this.homeMarker) {
      this.map.removeLayer(this.homeMarker);
    }
    if (this.selectedEmergency.latCasa && this.selectedEmergency.lngCasa) {
      const homeCoords: [number, number] = [this.selectedEmergency.latCasa, this.selectedEmergency.lngCasa];
      const homeIcon = L.divIcon({
        className: '',
        html: `<div style="width:20px;height:20px;border-radius:6px;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-house" style="color:white;font-size:10px;"></i></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
      this.homeMarker = L.marker(homeCoords, { icon: homeIcon }).addTo(this.map);
      this.homeMarker.bindPopup(`<b>Domicilio Registrado</b><br>${this.selectedEmergency.ubicacionNombre}`);
      
      // Ajustar vista para incluir ambos marcadores si no están exactamente en el mismo punto
      const bounds = L.latLngBounds([coords, homeCoords]);
      if (bounds.getNorthEast().distanceTo(bounds.getSouthWest()) > 10) { // Si hay más de 10 metros de diferencia
         this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  // === SIMULACIÓN DE LA PATRULLA EN EL MAPA (estilo Uber) ===
  // Punto de partida determinista (misma semilla/destino que el móvil => mismo recorrido).
  // PARA LA VERSIÓN REAL: reemplazar el cálculo por la posición GPS real de la patrulla.
  private patrolStart(destLat: number, destLng: number, seed: number) {
    const ang = (((seed * 47) % 360) * Math.PI) / 180;
    const distKm = 2.5;
    const dLat = (distKm / 111) * Math.cos(ang);
    const cosLat = Math.cos((destLat * Math.PI) / 180) || 1;
    const dLng = (distKm / (111 * cosLat)) * Math.sin(ang);
    return { lat: destLat + dLat, lng: destLng + dLng };
  }

  updatePatrolMarker() {
    if (!this.map || typeof L === 'undefined') return;

    const em = this.selectedEmergency;
    const despachada = !!em && em.estado === 'Despachada';

    if (!em || !despachada) {
      if (this.patrolMarker) { this.map.removeLayer(this.patrolMarker); this.patrolMarker = null; }
      if (this.patrolLine) { this.map.removeLayer(this.patrolLine); this.patrolLine = null; }
      return;
    }

    // Registrar el momento del despacho una sola vez por alerta
    if (!this.dispatchStarts[em.id]) this.dispatchStarts[em.id] = Date.now();

    const inicio = this.patrolStart(em.lat, em.lng, em.id);
    this.fetchPatrolRoute(em.id, inicio, { lat: em.lat, lng: em.lng });
    const progreso = Math.max(0, Math.min(1, (Date.now() - this.dispatchStarts[em.id]) / (this.ETA_TOTAL_SEG * 1000)));
    const ruta = this.patrolRoutes[em.id];
    const pos: [number, number] = (ruta && ruta.length > 1)
      ? this.pointAlongRoute(ruta, progreso)
      : [inicio.lat + (em.lat - inicio.lat) * progreso, inicio.lng + (em.lng - inicio.lng) * progreso];

    if (!this.patrolMarker) {
      const patrolIcon = L.divIcon({
        className: 'patrol-pin',
        html: `<div style="width:34px;height:34px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px"><i class="fa-solid fa-car-side"></i></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      this.patrolMarker = L.marker(pos, { icon: patrolIcon, zIndexOffset: 1000 }).addTo(this.map);
      this.patrolMarker.bindPopup('Patrulla 42 — Carabineros');
    } else {
      this.patrolMarker.setLatLng(pos);
    }

    if (this.patrolLine) { this.map.removeLayer(this.patrolLine); }
    const lineaPts: [number, number][] = (ruta && ruta.length > 1) ? ruta : [pos, [em.lat, em.lng]];
    this.patrolLine = L.polyline(lineaPts, {
      color: '#2563eb', weight: 4, opacity: 0.75, lineJoin: 'round', lineCap: 'round'
    }).addTo(this.map);
  }

  // Trae la ruta por calles desde OSRM (gratis, sin API key). fetch nativo para no pasar por el interceptor.
  private fetchPatrolRoute(id: number, inicio: { lat: number; lng: number }, dest: { lat: number; lng: number }) {
    if (this.patrolRoutes[id] || this.patrolRouteFetching[id]) return;
    this.patrolRouteFetching[id] = true;
    const url = `https://router.project-osrm.org/route/v1/driving/${inicio.lng},${inicio.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        this.patrolRoutes[id] = (coords && coords.length > 1)
          ? coords.map((c: number[]) => [c[1], c[0]] as [number, number])
          : [[inicio.lat, inicio.lng], [dest.lat, dest.lng]];
      })
      .catch(() => { this.patrolRoutes[id] = [[inicio.lat, inicio.lng], [dest.lat, dest.lng]]; })
      .finally(() => { this.patrolRouteFetching[id] = false; });
  }

  // Posición a lo largo de la ruta según progreso (0..1), por distancia recorrida.
  private pointAlongRoute(route: [number, number][], p: number): [number, number] {
    const prog = Math.max(0, Math.min(1, p));
    if (route.length === 1) return route[0];
    const dist = (a: [number, number], b: [number, number]) =>
      Math.hypot(a[0] - b[0], (a[1] - b[1]) * Math.cos((a[0] * Math.PI) / 180));
    const seg: number[] = [];
    let total = 0;
    for (let i = 1; i < route.length; i++) { const d = dist(route[i - 1], route[i]); seg.push(d); total += d; }
    if (total === 0) return route[route.length - 1];
    let target = prog * total;
    for (let i = 0; i < seg.length; i++) {
      if (target <= seg[i]) {
        const f = seg[i] === 0 ? 0 : target / seg[i];
        return [route[i][0] + (route[i + 1][0] - route[i][0]) * f, route[i][1] + (route[i + 1][1] - route[i][1]) * f];
      }
      target -= seg[i];
    }
    return route[route.length - 1];
  }

  selectEmergency(item: EmergencyCase) {
    // Desconectar cliente previo si existe
    if (this.webrtcStompClient) {
      this.webrtcStompClient.deactivate();
      this.webrtcStompClient = null;
    }
    this.endVideoCall();

    this.selectedEmergency = item;
    this.selectedEmergencyStreet = 'Buscando calle...';
    this.showFullAlertAddress = false;
    this.showFullHomeAddress = false;

    // Inicializar STOMP para WebRTC y escuchar llamadas entrantes
    const rutLimpiado = item.rut.replace(/[^0-9Kk]/g, '');
    const wsUrl = environment.apiUrl.replace('http', 'ws') + '/ws-chat';
    this.webrtcStompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        this.webrtcStompClient?.subscribe(`/topic/webrtc/${rutLimpiado}`, async (message) => {
          const data = JSON.parse(message.body);
          if (data.type === 'call_request' && data.from === 'ciudadano') {
            this.ngZone.run(() => {
              this.isReceivingCall = true;
              this.playAlarmSound();
              this.cdr.detectChanges();
            });
          } else if (data.type === 'call_rejected' || data.type === 'call_ended') {
            this.ngZone.run(() => {
              this.isCalling = false;
              this.isReceivingCall = false;
              this.endVideoCall();
              this.cdr.detectChanges();
            });
          } else if (data.type === 'call_accepted' && this.isCalling) {
            this.ngZone.run(async () => {
              this.isCalling = false;
              this.isVideoCallActive = true;
              this.cdr.detectChanges(); // Render video elements
              await this.initMedia();
              
              // Web initiated the call, Mobile accepted and is ready. Web creates the offer.
              if (!this.peerConnection) return;
              const offer = await this.peerConnection.createOffer();
              await this.peerConnection.setLocalDescription(offer);
              this.webrtcStompClient?.publish({ 
                destination: `/app/webrtc/${rutLimpiado}`, 
                body: JSON.stringify({ type: 'offer', sdp: this.peerConnection.localDescription }) 
              });
            });
          } else if (data.type === 'offer' && this.isVideoCallActive) {
            await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await this.peerConnection?.createAnswer();
            await this.peerConnection?.setLocalDescription(answer!);
            this.webrtcStompClient?.publish({
              destination: `/app/webrtc/${rutLimpiado}`,
              body: JSON.stringify({ type: 'answer', sdp: this.peerConnection?.localDescription })
            });
            if (this.peerConnection && (this.peerConnection as any).pendingCandidates) {
              for (const c of (this.peerConnection as any).pendingCandidates) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
              }
              (this.peerConnection as any).pendingCandidates = [];
            }
          } else if (data.type === 'answer' && this.isVideoCallActive) {
            await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.sdp));
            if (this.peerConnection && (this.peerConnection as any).pendingCandidates) {
              for (const c of (this.peerConnection as any).pendingCandidates) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
              }
              (this.peerConnection as any).pendingCandidates = [];
            }
          } else if (data.type === 'candidate' && this.isVideoCallActive) {
            if (this.peerConnection?.remoteDescription) {
              await this.peerConnection?.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
              if (this.peerConnection) {
                if (!(this.peerConnection as any).pendingCandidates) (this.peerConnection as any).pendingCandidates = [];
                (this.peerConnection as any).pendingCandidates.push(data.candidate);
              }
            }
          } else if (data.type === 'ready' && this.isVideoCallActive) {
            // Mobile initiated the call, Web accepted, and now Mobile is ready. Web creates the offer.
            if (!this.peerConnection) return;
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.webrtcStompClient?.publish({
              destination: `/app/webrtc/${rutLimpiado}`,
              body: JSON.stringify({ type: 'offer', sdp: this.peerConnection.localDescription })
            });
          }
        });
      }
    });
    this.webrtcStompClient.activate();

    // Reverse Geocoding (Nominatim) for Alert GPS
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${item.lat}&lon=${item.lng}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        this.selectedEmergencyStreet = data?.display_name || 'Calle no encontrada en el mapa';
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.selectedEmergencyStreet = 'Error de conexión (GPS)';
        this.cdr.detectChanges();
      });

    // Reverse Geocoding (Nominatim) for Home GPS
    this.selectedEmergencyHomeStreet = 'Buscando calle...';
    if (item.latCasa !== undefined && item.lngCasa !== undefined) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${item.latCasa}&lon=${item.lngCasa}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          this.selectedEmergencyHomeStreet = data?.display_name || 'Calle de domicilio no encontrada';
          this.cdr.detectChanges();
        })
        .catch(() => {
          this.selectedEmergencyHomeStreet = 'Error de conexión (GPS Casa)';
          this.cdr.detectChanges();
        });
    } else {
      this.selectedEmergencyHomeStreet = 'Coordenadas de casa no disponibles';
    }

    // Fetch Patrulla info si el estado es Despachada
    if (item.estado === 'Despachada' || item.estado === 'En Proceso' || item.estado === 'Finalizada') {
      this.http.get<any[]>(`${environment.apiUrl}/api/despachos/alerta/${item.id}`).subscribe({
        next: (despachos) => {
          if (despachos && despachos.length > 0) {
            const despacho = despachos[0]; // Tomar el primer despacho activo
            const patrulla = despacho.patrulla;
            if (patrulla) {
              this.selectedEmergency!.patrullaInfo = {
                patente: patrulla.patente,
                estado: patrulla.estado,
                eta: 'Calculando...'
              };
              
              // Calculate ETA based on coordinates if patrol is moving
              if (patrulla.longitudLatitud) {
                const parts = patrulla.longitudLatitud.split(',');
                if (parts.length === 2) {
                  const pLat = parseFloat(parts[0]);
                  const pLng = parseFloat(parts[1]);
                  
                  // Haversine distance
                  const R = 6371; // km
                  const dLat = (item.lat - pLat) * Math.PI / 180;
                  const dLon = (item.lng - pLng) * Math.PI / 180;
                  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(pLat * Math.PI / 180) * Math.cos(item.lat * Math.PI / 180) *
                            Math.sin(dLon/2) * Math.sin(dLon/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  const d = R * c; // Distance in km
                  
                  // Assume 50km/h average speed in city
                  const speedKmh = 50;
                  const timeHours = d / speedKmh;
                  const timeMinutes = Math.max(1, Math.round(timeHours * 60));
                  
                  this.selectedEmergency!.patrullaInfo.eta = `~${timeMinutes} min`;
                }
              } else {
                 this.selectedEmergency!.patrullaInfo.eta = `N/A`;
              }
              this.cdr.detectChanges();
            }
          }
        },
        error: (err) => console.error('Error fetching despachos', err)
      });
    }

    // Reverse Geocoding (Nominatim) for Home GPS
    if (item.latCasa && item.lngCasa) {
      this.selectedEmergencyHomeStreet = 'Buscando calle...';
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${item.latCasa}&lon=${item.lngCasa}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          this.selectedEmergencyHomeStreet = data?.display_name || 'Calle no encontrada en el mapa';
          this.cdr.detectChanges();
        })
        .catch(() => {
          this.selectedEmergencyHomeStreet = 'Error de conexión (GPS)';
          this.cdr.detectChanges();
        });
    } else {
      this.selectedEmergencyHomeStreet = '';
    }
    
    // Mover el mapa
    if (this.map && typeof L !== 'undefined') {
      const coords: [number, number] = [item.lat, item.lng];
      this.map.setView(coords, 15);
      this.updateMapMarker();
    } else if (!this.map && typeof L !== 'undefined') {
      setTimeout(() => {
        if (document.getElementById('leaflet-map-element')) {
          this.initMap();
        }
      }, 100);
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

  switchTab(tab: 'dashboard' | 'history' | 'validations') {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        } else {
          this.initMap();
        }
      }, 100);
    } else {
      if (this.map) {
        this.map.remove();
        this.map = null;
        this.marker = null;
        this.patrolMarker = null;
        this.patrolLine = null;
      }
    }
  }

  aprobarUsuario(usuario: any) {
    this.http.put(`${environment.apiUrl}/usuarios/${usuario.id}/estado`, { estado: 'Activo' })
      .subscribe({
        next: () => {
          this.pendingUsers = this.pendingUsers.filter(u => u.id !== usuario.id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error aprobando usuario', err)
      });
  }

  rechazarUsuario(usuario: any) {
    this.http.put(`${environment.apiUrl}/usuarios/${usuario.id}/estado`, { estado: 'Rechazado' })
      .subscribe({
        next: () => {
          this.pendingUsers = this.pendingUsers.filter(u => u.id !== usuario.id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error rechazando usuario', err)
      });
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
    const casos = this.getFilteredHistory();
    const fecha = new Date().toLocaleString('es-CL');

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Encabezado institucional
    doc.setFillColor(27, 67, 50); // verde CENCO
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CENCO — Historial de Emergencias', 40, 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Carabineros de Chile', 40, 52);

    doc.setTextColor(90, 90, 90);
    doc.setFontSize(9);
    doc.text(`Generado: ${fecha}  ·  Total de casos: ${casos.length}`, 40, 90);

    autoTable(doc, {
      startY: 104,
      head: [['Ciudadano', 'RUT', 'Incidente', 'Hora', 'Estado', 'Notas de Despacho']],
      body: casos.map((c) => [c.nombre, c.rut, c.incidente, c.horaIngreso, c.estado, (c.notasOperador && c.notasOperador.trim()) ? c.notasOperador : '—']),
      styles: { fontSize: 8, cellPadding: 5, valign: 'top' },
      headStyles: { fillColor: [27, 67, 50], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 2: { cellWidth: 95 }, 5: { cellWidth: 120 } },
      margin: { left: 40, right: 40 },
      didDrawPage: (data: any) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Documento generado por el Panel CENCO · Uso interno', 40, pageHeight - 20);
        doc.text(`Página ${doc.getNumberOfPages()}`, pageSize.getWidth() - 80, pageHeight - 20);
      },
    });

    if (casos.length === 0) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(11);
      doc.text('No hay emergencias registradas en el historial.', 40, 130);
    }

    const nombreArchivo = `historial-emergencias-cenco-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  }

  // ===== INFORME DETALLADO DE UN CASO INDIVIDUAL (PDF) =====
  exportCasePDF(caso: EmergencyCase) {
    const id = caso.id;
    // Traemos triage y chat frescos del backend para un informe completo
    this.http.get<any[]>(`${environment.apiUrl}/api/triage-alertas/alerta/${id}`).subscribe({
      next: (triageList) => {
        let victimaHerida: 'SI' | 'NO' = 'NO';
        let agresorLugar: 'SI' | 'NO' = 'NO';
        let armaFuego: 'SI' | 'NO' = 'NO';
        (triageList || []).forEach((t: any) => {
          const pre = (t.preguntaClave || '').toUpperCase();
          if (pre.includes('HERIDO')) victimaHerida = t.respuestaSordo ? 'SI' : 'NO';
          if (pre.includes('ARMA')) armaFuego = t.respuestaSordo ? 'SI' : 'NO';
          if (pre.includes('CASA') || pre.includes('LUGAR')) agresorLugar = t.respuestaSordo ? 'SI' : 'NO';
        });
        const triage: TriageInfo = { victimaHerida, agresorLugar, armaFuego };
        this.http.get<any[]>(`${environment.apiUrl}/api/chats/alerta/${id}`).subscribe({
          next: (chatList) => this.buildCasePDF(caso, triage, this.mapChatList(chatList, caso)),
          error: () => this.buildCasePDF(caso, triage, caso.mensajes || [])
        });
      },
      error: () => this.buildCasePDF(caso, caso.triage, caso.mensajes || [])
    });
  }

  private mapChatList(chatList: any[], caso: EmergencyCase): ChatMessage[] {
    const lista = (chatList || []).map((m: any) => {
      let hora = '00:00';
      if (m.fechaHoraEnvio && m.fechaHoraEnvio.includes('T')) hora = m.fechaHoraEnvio.substring(11, 16);
      let autor: 'usuario' | 'operador' | 'sistema' = 'usuario';
      if (m.emisorId === 1) autor = 'operador';
      else if (m.emisorId === 0) autor = 'sistema';
      return { id: m.id, autor, texto: m.texto, hora, esGif: m.tipo === 'gif' } as ChatMessage;
    });
    return lista.length ? lista : (caso.mensajes || []);
  }

  private buildCasePDF(caso: EmergencyCase, triage: TriageInfo, mensajes: ChatMessage[]) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const fecha = new Date().toLocaleString('es-CL');

    // Encabezado institucional
    doc.setFillColor(27, 67, 50);
    doc.rect(0, 0, W, 78, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('CENCO — Informe de Emergencia', 40, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Carabineros de Chile · Documento operativo confidencial', 40, 50);
    doc.setFontSize(9);
    doc.text(`Folio #${caso.id.toString().slice(-6)}   ·   Estado: ${caso.estado}`, 40, 66);
    doc.setTextColor(210, 225, 215);
    doc.setFontSize(8);
    doc.text(`Generado: ${fecha}`, W - 40, 66, { align: 'right' });

    const sectionTitle = (txt: string, y: number) => {
      doc.setDrawColor(27, 67, 50);
      doc.setLineWidth(2);
      doc.line(40, y - 9, 40, y + 1);
      doc.setTextColor(27, 67, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(txt, 50, y);
      return y + 8;
    };

    let y = 100;

    y = sectionTitle('DATOS DEL CIUDADANO', y);
    autoTable(doc, {
      startY: y, theme: 'plain', margin: { left: 40, right: 40 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150, textColor: [90, 90, 90] } },
      body: [
        ['Nombre', caso.nombre],
        ['RUT', caso.rut],
        ['Teléfono', caso.telefono || 'No registrado'],
        ['Información médica', caso.infoMedica || 'Sin información registrada'],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    y = sectionTitle('DATOS DEL INCIDENTE', y);
    autoTable(doc, {
      startY: y, theme: 'plain', margin: { left: 40, right: 40 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150, textColor: [90, 90, 90] } },
      body: [
        ['Tipo de incidente', caso.incidente],
        ['Hora de ingreso', caso.horaIngreso],
        ['Estado actual', caso.estado],
        ['Ubicación', caso.ubicacionNombre || '—'],
        ['Coordenadas GPS', `${caso.lat}, ${caso.lng}`],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    y = sectionTitle('EVALUACIÓN TÁCTICA (TRIAGE)', y);
    autoTable(doc, {
      startY: y, margin: { left: 40, right: 40 },
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [27, 67, 50], textColor: 255, fontStyle: 'bold' },
      head: [['Evaluación', 'Respuesta']],
      body: [
        ['¿Víctima herida?', triage.victimaHerida],
        ['¿Agresor en el lugar?', triage.agresorLugar],
        ['¿Arma de fuego involucrada?', triage.armaFuego],
      ],
      didParseCell: (d: any) => {
        if (d.section === 'body' && d.column.index === 1) {
          d.cell.styles.fontStyle = 'bold';
          d.cell.styles.textColor = d.cell.raw === 'SI' ? [197, 48, 48] : [56, 120, 80];
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    y = sectionTitle('NOTAS DE DESPACHO', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    const notas = (caso.notasOperador && caso.notasOperador.trim()) ? caso.notasOperador : 'Sin anotaciones registradas.';
    const notasLines = doc.splitTextToSize(notas, W - 80) as string[];
    doc.text(notasLines, 40, y + 10);
    y = y + 10 + notasLines.length * 13 + 16;

    y = sectionTitle('HISTORIAL DE CONVERSACIÓN (CHAT)', y);
    if (!mensajes || mensajes.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(125, 125, 125);
      doc.text('No hay mensajes registrados para este caso.', 40, y + 12);
    } else {
      const autorLabel = (a: string) => a === 'operador' ? 'CENCO' : a === 'sistema' ? 'Sistema' : 'Ciudadano';
      autoTable(doc, {
        startY: y + 4, margin: { left: 40, right: 40 },
        styles: { fontSize: 9, cellPadding: 5, valign: 'top' },
        headStyles: { fillColor: [27, 67, 50], textColor: 255, fontStyle: 'bold' },
        head: [['Hora', 'Emisor', 'Mensaje']],
        body: mensajes.map(m => [m.hora, autorLabel(m.autor), m.esGif ? '[Mensaje en LSCh]' : (m.texto || '')]),
        columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 72, fontStyle: 'bold' }, 2: { cellWidth: 'auto' } },
        didParseCell: (d: any) => {
          if (d.section === 'body' && d.column.index === 1) {
            d.cell.styles.textColor = d.cell.raw === 'CENCO' ? [27, 67, 50] : [70, 70, 70];
          }
        },
      });
    }

    // Pie de página en todas las páginas
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      const H = doc.internal.pageSize.getHeight();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Documento confidencial · Panel CENCO · Uso interno Carabineros de Chile', 40, H - 20);
      doc.text(`Página ${i} de ${pages}`, W - 40, H - 20, { align: 'right' });
    }

    doc.save(`informe-caso-${caso.id.toString().slice(-6)}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  sendTextMessage() {
    if (!this.chatText.trim() || !this.selectedEmergency) return;
    const txt = this.chatText.trim();
    this.chatText = '';
    
    this.http.post(`${environment.apiUrl}/api/chats`, {
      texto: txt,
      fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
      emisorId: 1, // operator
      tipo: 'texto',
      alerta: { id: this.selectedEmergency.id }
    }).subscribe({
      next: () => this.fetchSelectedEmergencyDetails(),
      error: (err) => console.error('Error al enviar mensaje:', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedEmergency) {
      const formData = new FormData();
      formData.append('file', file);
      
      this.http.post<any>(`${environment.apiUrl}/api/uploads`, formData).subscribe({
        next: (res) => {
          this.http.post(`${environment.apiUrl}/api/chats`, {
            texto: res.fileName,
            fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
            emisorId: 1, // operator
            tipo: 'archivo',
            archivoUrl: res.fileUrl,
            tipoArchivo: res.fileType,
            alerta: { id: this.selectedEmergency!.id }
          }).subscribe({
            next: () => this.fetchSelectedEmergencyDetails(),
            error: (err) => console.error('Error al enviar mensaje archivo:', err)
          });
        },
        error: (err) => console.error('Error al subir archivo:', err)
      });
    }
  }

  sendPresetGifMsg(gifLabel: string) {
    if (!this.selectedEmergency) return;
    
    this.http.post(`${environment.apiUrl}/api/chats`, {
      texto: gifLabel,
      fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
      emisorId: 1, // operator
      tipo: 'texto',
      alerta: { id: this.selectedEmergency.id }
    }).subscribe({
      next: () => this.fetchSelectedEmergencyDetails(),
      error: (err) => console.error('Error al enviar GIF rápido:', err)
    });
  }

  dispatchUnit(unitType: 'patrulla' | 'ambulancia' | 'bomberos') {
    if (!this.selectedEmergency) return;
    
    let nextEstado: 'En Proceso' | 'Despachada' = 'En Proceso';
    let actionText = '';
    
    if (unitType === 'patrulla') {
      nextEstado = 'Despachada';
      actionText = 'SE DESPACHÓ: Radio Patrulla (Carabineros) al lugar del incidente.';
      const patente = 'Z-' + Math.floor(Math.random() * 9000 + 1000); // Ficticia
      
      this.http.post(`${environment.apiUrl}/api/patrullas`, {
        patente: patente,
        longitudLatitud: `${this.selectedEmergency.lat},${this.selectedEmergency.lng}`,
        estado: 'En Camino'
      }).subscribe({
        next: (patrulla: any) => {
          console.log('Patrulla registrada:', patrulla);
          this.http.post(`${environment.apiUrl}/api/despachos`, {
            fechaHoraInicio: new Date().toISOString().replace('Z', ''),
            estado: 'En Camino',
            patrulla: { id: patrulla.id },
            alerta: { id: this.selectedEmergency!.id }
          }).subscribe({
            next: (despacho) => {
              console.log('Despacho registrado:', despacho);
              this.selectedEmergency!.patrullaInfo = {
                patente: patrulla.patente,
                estado: patrulla.estado,
                eta: '~6 min'
              };
              this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al registrar despacho:', err)
          });
        },
        error: (err) => console.error('Error al registrar patrulla:', err)
      });

    } else if (unitType === 'ambulancia') {
      nextEstado = 'En Proceso';
      actionText = 'SE ENLAZÓ CON SAMU: Ambulancia de emergencia en camino.';
    } else {
      nextEstado = 'En Proceso';
      actionText = 'SE ENLAZÓ CON BOMBEROS: Carro bomba despachado.';
    }

    this.http.get<any>(`${environment.apiUrl}/api/alertas/${this.selectedEmergency.id}`)
      .subscribe({
        next: (alerta) => {
          alerta.estado = nextEstado;
          this.http.put(`${environment.apiUrl}/api/alertas/${this.selectedEmergency!.id}`, alerta)
            .subscribe({
              next: () => {
                this.http.post(`${environment.apiUrl}/api/chats`, {
                  texto: actionText,
                  fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
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

    this.http.get<any>(`${environment.apiUrl}/api/alertas/${this.selectedEmergency.id}`)
      .subscribe({
        next: (alerta) => {
          alerta.estado = 'Finalizada';
          this.http.put(`${environment.apiUrl}/api/alertas/${this.selectedEmergency!.id}`, alerta)
            .subscribe({
              next: () => {
                this.http.post(`${environment.apiUrl}/api/chats`, {
                  texto: 'CASO CERRADO: Operación finalizada y guardada en historial.',
                  fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
                  emisorId: 0, // system
                  tipo: 'texto',
                  alerta: { id: this.selectedEmergency!.id }
                }).subscribe({
                  next: () => {
                    this.http.get<any[]>(`${environment.apiUrl}/api/despachos/alerta/${this.selectedEmergency!.id}`).subscribe({
                      next: (despachos) => {
                        if (despachos && despachos.length > 0) {
                          const despacho = despachos[0];
                          despacho.estado = 'Finalizado';
                          despacho.fechaHoraLlegada = new Date().toISOString().replace('Z', '');
                          this.http.put(`${environment.apiUrl}/api/despachos/${despacho.id}`, despacho).subscribe({
                            next: () => this.clearActiveEmergency()
                          });
                        } else {
                          this.clearActiveEmergency();
                        }
                      },
                      error: () => this.clearActiveEmergency()
                    });
                  },
                  error: (err) => console.error('Error al cerrar chat:', err)
                });
              },
              error: (err) => console.error('Error al finalizar alerta:', err)
            });
        }
      });
  }

  private clearActiveEmergency() {
    this.selectedEmergency = null;
    if (this.marker && this.map) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  async initMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (this.localVideoRef) {
        this.localVideoRef.nativeElement.srcObject = this.localStream;
      }
    } catch (e: any) {
      console.error('Error accessing camera', e);
      if (e.name === 'NotAllowedError') {
        alert('Permiso denegado. Por favor, habilita el acceso a la cámara y micrófono en el candado de la barra de direcciones de tu navegador.');
      } else if (e.name === 'NotFoundError') {
        alert('No se encontró ninguna cámara o micrófono conectado a tu equipo.');
      } else {
        alert('No se pudo acceder a la cámara o micrófono. Por favor verifica tu configuración.');
      }
      this.isCalling = false;
      this.isReceivingCall = false;
      this.isVideoCallActive = false;
      return;
    }

    this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    
    this.localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, this.localStream!);
    });

    this.peerConnection.ontrack = (event) => {
      if (this.remoteVideoRef && event.streams[0]) {
        this.remoteVideoRef.nativeElement.srcObject = event.streams[0];
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.webrtcStompClient?.connected && this.selectedEmergency) {
        const rutLimpiado = this.selectedEmergency.rut.replace(/[^0-9Kk]/g, '');
        this.webrtcStompClient.publish({
          destination: `/app/webrtc/${rutLimpiado}`,
          body: JSON.stringify({ type: 'candidate', candidate: event.candidate })
        });
      }
    };
  }

  startVideoCall() {
    if (!this.selectedEmergency || !this.webrtcStompClient?.connected) return;
    const rutLimpiado = this.selectedEmergency.rut.replace(/[^0-9Kk]/g, '');
    this.isCalling = true;
    this.webrtcStompClient.publish({
      destination: `/app/webrtc/${rutLimpiado}`,
      body: JSON.stringify({ type: 'call_request', from: 'operador' })
    });
  }

  async acceptCall() {
    if (!this.selectedEmergency || !this.webrtcStompClient?.connected) return;
    const rutLimpiado = this.selectedEmergency.rut.replace(/[^0-9Kk]/g, '');
    this.isReceivingCall = false;
    this.isVideoCallActive = true;
    this.cdr.detectChanges(); // Renderiza elementos de video
    await this.initMedia();
    this.webrtcStompClient.publish({
      destination: `/app/webrtc/${rutLimpiado}`,
      body: JSON.stringify({ type: 'call_accepted' })
    });
  }

  rejectCall() {
    if (!this.selectedEmergency || !this.webrtcStompClient?.connected) return;
    const rutLimpiado = this.selectedEmergency.rut.replace(/[^0-9Kk]/g, '');
    this.isReceivingCall = false;
    this.isCalling = false;
    this.webrtcStompClient.publish({
      destination: `/app/webrtc/${rutLimpiado}`,
      body: JSON.stringify({ type: 'call_rejected' })
    });
  }

  endVideoCall() {
    this.isVideoCallActive = false;
    this.isCalling = false;
    this.isReceivingCall = false;

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Si cerramos y sigue activo, notificar a la otra parte
    if (this.webrtcStompClient?.connected && this.selectedEmergency) {
      const rutLimpiado = this.selectedEmergency.rut.replace(/[^0-9Kk]/g, '');
      this.webrtcStompClient.publish({
        destination: `/app/webrtc/${rutLimpiado}`,
        body: JSON.stringify({ type: 'call_ended' })
      });
    }

    // Nota: no desactivamos webrtcStompClient aquí, porque necesitamos
    // seguir escuchando llamadas entrantes mientras la emergencia esté seleccionada.
  }

  saveDispatchNotes() {
    if (!this.selectedEmergency) return;
    const notas = this.selectedEmergency.notasOperador || '';
    // Reflejar al instante en la lista del historial (no espera al backend ni al polling)
    const enLista = this.emergencies.find(e => e.id === this.selectedEmergency!.id);
    if (enLista) enLista.notasOperador = notas;
    this.http.get<any>(`${environment.apiUrl}/api/alertas/${this.selectedEmergency.id}`)
      .subscribe({
        next: (alerta) => {
          alerta.notasOperador = notas;
          this.http.put(`${environment.apiUrl}/api/alertas/${this.selectedEmergency!.id}`, alerta)
            .subscribe({
              next: () => alert('Notas de despacho guardadas correctamente.'),
              error: (err) => { console.error('Error al guardar notas:', err); alert('No se pudieron guardar las notas.'); }
            });
        },
        error: (err) => { console.error('Error al obtener la alerta:', err); alert('No se pudieron guardar las notas.'); }
      });
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

    this.http.post(`${environment.apiUrl}/api/alertas`, {
      fechaHoraInicio: new Date().toISOString().replace('Z', ''),
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
        this.http.post(`${environment.apiUrl}/api/chats`, {
          texto: 'Estoy en peligro',
          fechaHoraEnvio: new Date().toISOString().replace('Z', ''),
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
      incidente: backendAlerta.incidente || 'Alerta de Pánico',
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
      disponibleTriage: backendAlerta.disponibleTriage !== undefined ? backendAlerta.disponibleTriage : true,
      tags: ['NUEVA'],
      modoCamuflaje: backendAlerta.modoCamuflaje || false,
      notasOperador: backendAlerta.notasOperador || '',
      infoMedica: persona.infoMedica || 'Sin información médica registrada',
      nombreReferenciaCasa: persona.nombreReferenciaCasa,
      latCasa: persona.latitudCasa,
      lngCasa: persona.longitudCasa,
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
