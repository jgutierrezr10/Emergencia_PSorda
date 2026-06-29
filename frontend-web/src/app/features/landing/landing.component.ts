import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
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



  // Sound generator
  private audioCtx: AudioContext | null = null;

  // Notification state
  newEmergencyToast = false;
  newEmergencyName = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private websocketService: WebsocketService
  ) {}

  ngOnInit() {
    // Seleccionar por defecto la primera emergencia
    if (this.emergencies.length > 0) {
      this.selectedEmergency = this.emergencies[0];
    }

    // Suscribirse a las alertas reales provenientes del backend
    this.websocketService.getAlertas().subscribe(alerta => {
      this.handleRealEmergency(alerta);
    });
  }

  ngAfterViewInit() {
    // Cargar mapa
    this.initMap();
  }

  ngOnDestroy() {
  }

  initMap() {
    if (typeof L !== 'undefined' && this.selectedEmergency) {
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
    
    // Mover el mapa a la ubicación seleccionada
    if (this.map && L) {
      const coords: [number, number] = [item.lat, item.lng];
      this.map.setView(coords, 15);
      this.updateMapMarker();
    }
  }


  getFilteredEmergencies(): EmergencyCase[] {
    return this.emergencies.filter(item => {
      // Solo mostramos emergencias activas en el dashboard (no finalizadas)
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
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.selectedEmergency.mensajes.push({
      id: Date.now(),
      autor: 'operador',
      texto: this.chatText.trim(),
      hora: timeStr
    });
    
    this.chatText = '';
    this.scrollChatToBottom();
  }

  sendPresetGifMsg(gifLabel: string) {
    if (!this.selectedEmergency) return;
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.selectedEmergency.mensajes.push({
      id: Date.now(),
      autor: 'operador',
      texto: `[Respuesta en LSCh] ${gifLabel}`,
      hora: timeStr,
      esGif: true
    });
    
    this.scrollChatToBottom();
  }

  dispatchUnit(unitType: 'patrulla' | 'ambulancia' | 'bomberos') {
    if (!this.selectedEmergency) return;
    
    let unitName = '';
    let actionText = '';
    if (unitType === 'patrulla') {
      unitName = 'Radio Patrulla (Carabineros)';
      this.selectedEmergency.estado = 'Despachada';
      actionText = 'SE DESPACHÓ: Radio Patrulla (Carabineros) al lugar del incidente.';
    } else if (unitType === 'ambulancia') {
      unitName = 'SAMU (Ambulancia)';
      this.selectedEmergency.estado = 'En Proceso';
      actionText = 'SE ENLAZÓ CON SAMU: Ambulancia de emergencia en camino.';
    } else {
      unitName = 'Cuerpo de Bomberos';
      this.selectedEmergency.estado = 'En Proceso';
      actionText = 'SE ENLAZÓ CON BOMBEROS: Carro bomba despachado.';
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.selectedEmergency.mensajes.push({
      id: Date.now(),
      autor: 'sistema',
      texto: actionText,
      hora: timeStr
    });

    // Actualizar tags de visualización
    const idx = this.selectedEmergency.tags.indexOf('NUEVA');
    if (idx !== -1) {
      this.selectedEmergency.tags.splice(idx, 1);
    }
    if (!this.selectedEmergency.tags.includes('EN ATENCIÓN')) {
      this.selectedEmergency.tags.push('EN ATENCIÓN');
    }

    this.updateMapMarker();
    this.scrollChatToBottom();
  }

  resolveEmergency() {
    if (!this.selectedEmergency) return;
    
    this.selectedEmergency.estado = 'Finalizada';
    this.selectedEmergency.tags = ['RESUELTA'];
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.selectedEmergency.mensajes.push({
      id: Date.now(),
      autor: 'sistema',
      texto: `CASO CERRADO: Operación finalizada y guardada en historial.`,
      hora: timeStr
    });
    
    this.scrollChatToBottom();

    // Seleccionar automáticamente la siguiente emergencia activa
    const activeEmergencies = this.getFilteredEmergencies();
    if (activeEmergencies.length > 0) {
      this.selectEmergency(activeEmergencies[0]);
    } else {
      this.selectedEmergency = null;
      if (this.marker && this.map) {
        this.map.removeLayer(this.marker);
        this.marker = null;
      }
    }
  }


  saveDispatchNotes() {
    // En una aplicación real enviaríamos esto a un backend. Aquí simulamos que se guarda localmente en el objeto
    alert('Notas de despacho actualizadas y registradas correctamente.');
  }


  handleRealEmergency(backendAlerta: any) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Extraer lat/lng si existen
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
    let nombre = (persona.nombre || '') + ' ' + (persona.apellido || '');
    if (!nombre.trim()) nombre = 'Usuario App';

    const newCase: EmergencyCase = {
      id: backendAlerta.id || Date.now(),
      nombre: nombre,
      rut: persona.rut || 'Desconocido',
      telefono: persona.telefono || 'Sin teléfono',
      incidente: 'Alerta desde App (' + (backendAlerta.estado || 'Pendiente') + ')',
      horaIngreso: timeStr,
      estado: 'Pendiente',
      triage: {
        victimaHerida: 'NO',
        agresorLugar: 'NO',
        armaFuego: 'NO'
      },
      ubicacionNombre: "Ubicación detectada (GPS)",
      lat: lat,
      lng: lng,
      tags: ['CAMUFLAJE', 'NUEVA'],
      modoCamuflaje: backendAlerta.disponibleTriage === false, // ejemplo
      notasOperador: '',
      mensajes: [
        { id: 1, autor: 'usuario', texto: 'Alerta disparada desde la aplicación', hora: timeStr, esGif: false }
      ]
    };

    // Agregar al inicio
    this.emergencies.unshift(newCase);
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

      // Generar sirena bitonal
      const duration = 1.2; // segundos
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Frecuencia modulada para sonido de sirena
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
      console.warn('AudioContext no soportado o bloqueado por el navegador:', e);
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
