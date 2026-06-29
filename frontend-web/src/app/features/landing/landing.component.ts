import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';

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
  
  emergencies: EmergencyCase[] = [
    {
      id: 1,
      nombre: 'María González',
      rut: '18.234.567-8',
      telefono: '987654321',
      incidente: 'Asalto en progreso',
      horaIngreso: '14:32',
      estado: 'Pendiente',
      triage: {
        victimaHerida: 'SI',
        agresorLugar: 'SI',
        armaFuego: 'NO'
      },
      ubicacionNombre: "Av. Libertador Bernardo O'Higgins 3250",
      lat: -33.4503,
      lng: -70.6781,
      tags: ['CAMUFLAJE', 'NUEVA'],
      modoCamuflaje: true,
      notasOperador: '',
      mensajes: [
        { id: 1, autor: 'usuario', texto: 'Estoy en peligro', hora: '14:32', esGif: true },
        { id: 2, autor: 'operador', texto: 'Entendido, ya tenemos su señal en la central CENCO. Mantenga su celular oculto. ¿Hay algún sospechoso armado?', hora: '14:32' },
        { id: 3, autor: 'usuario', texto: 'No', hora: '14:33', esGif: true }
      ]
    },
    {
      id: 2,
      nombre: 'Carlos Muñoz',
      rut: '16.876.543-2',
      telefono: '912345678',
      incidente: 'Accidente de tránsito',
      horaIngreso: '14:28',
      estado: 'En Proceso',
      triage: {
        victimaHerida: 'SI',
        agresorLugar: 'NO',
        armaFuego: 'NO'
      },
      ubicacionNombre: 'Av. Providencia 1250, Providencia',
      lat: -33.4262,
      lng: -70.6184,
      tags: ['EN ATENCIÓN'],
      modoCamuflaje: false,
      notasOperador: 'Se despachó patrulla policial del sector 12 para peritaje inicial.',
      mensajes: [
        { id: 1, autor: 'usuario', texto: 'Necesito ayuda', hora: '14:28', esGif: true },
        { id: 2, autor: 'operador', texto: 'CENCO recibido. ¿Tiene lesiones o hay heridos en la calle?', hora: '14:28' },
        { id: 3, autor: 'usuario', texto: 'Sí, estoy herido leve en la pierna', hora: '14:29' }
      ]
    },
    {
      id: 3,
      nombre: 'Patricia Soto',
      rut: '19.123.456-7',
      telefono: '944455566',
      incidente: 'Violencia intrafamiliar',
      horaIngreso: '14:15',
      estado: 'Pendiente',
      triage: {
        victimaHerida: 'SI',
        agresorLugar: 'SI',
        armaFuego: 'SI'
      },
      ubicacionNombre: 'Gran Avenida 4500, San Miguel',
      lat: -33.5015,
      lng: -70.6521,
      tags: ['CAMUFLAJE', 'NUEVA'],
      modoCamuflaje: true,
      notasOperador: '',
      mensajes: [
        { id: 1, autor: 'usuario', texto: 'Estoy en peligro', hora: '14:15', esGif: true },
        { id: 2, autor: 'operador', texto: 'Mensaje recibido de inmediato. No hable. ¿El agresor tiene armas?', hora: '14:16' },
        { id: 3, autor: 'usuario', texto: 'Sí', hora: '14:16', esGif: true }
      ]
    },
    {
      id: 4,
      nombre: 'Sofía Valdés',
      rut: '20.651.042-3',
      telefono: '912345999',
      incidente: 'Accidente de tránsito',
      horaIngreso: '11:15',
      estado: 'Finalizada',
      triage: {
        victimaHerida: 'NO',
        agresorLugar: 'NO',
        armaFuego: 'NO'
      },
      ubicacionNombre: 'Av. Apoquindo 4000, Las Condes',
      lat: -33.4124,
      lng: -70.5785,
      tags: ['RESUELTA'],
      modoCamuflaje: false,
      notasOperador: 'Se resolvió la colisión por alcance sin lesionados graves. Carabineros en el lugar.',
      mensajes: []
    },
    {
      id: 5,
      nombre: 'Roberto Barraza',
      rut: '17.432.901-K',
      telefono: '988877766',
      incidente: 'Sospecha de Robo',
      horaIngreso: '09:30',
      estado: 'Finalizada',
      triage: {
        victimaHerida: 'NO',
        agresorLugar: 'SI',
        armaFuego: 'NO'
      },
      ubicacionNombre: 'Patronato 320, Recoleta',
      lat: -33.4285,
      lng: -70.6482,
      tags: ['RESUELTA'],
      modoCamuflaje: false,
      notasOperador: 'Sospechoso huyó ante la llegada de la patrulla. Se tomaron declaraciones.',
      mensajes: []
    }
  ];

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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Seleccionar por defecto la primera emergencia
    if (this.emergencies.length > 0) {
      this.selectedEmergency = this.emergencies[0];
    }
  }

  ngAfterViewInit() {
    // Cargar mapa
    this.initMap();
  }

  ngOnDestroy() {
    if (this.videoCallTimer) {
      clearInterval(this.videoCallTimer);
    }
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

  // --- Simulador de Nueva Emergencia ---
  simulateIncomingEmergency() {
    const randomNames = ['Roberto Barraza', 'Sofía Valdés', 'Jorge Sanhueza', 'Camila Leyton'];
    const randomRuts = ['17.432.901-k', '20.651.042-3', '15.981.332-9', '18.502.119-2'];
    const randomIncidents = ['Sospecha de Robo', 'Accidente de tránsito', 'Violencia intrafamiliar', 'Intento de asalto'];
    const randomCoords = [
      { lat: -33.4550, lng: -70.6800, addr: "Av. General Velásquez 120, Estación Central" },
      { lat: -33.4350, lng: -70.6400, addr: "Av. Portugal 440, Santiago" },
      { lat: -33.4680, lng: -70.6920, addr: "Departamental 1200, Cerrillos" }
    ];

    const idx = Math.floor(Math.random() * randomNames.length);
    const coordIdx = Math.floor(Math.random() * randomCoords.length);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newCase: EmergencyCase = {
      id: Date.now(),
      nombre: randomNames[idx],
      rut: randomRuts[idx],
      telefono: '9' + Math.floor(10000000 + Math.random() * 90000000),
      incidente: randomIncidents[idx],
      horaIngreso: timeStr,
      estado: 'Pendiente',
      triage: {
        victimaHerida: Math.random() > 0.5 ? 'SI' : 'NO',
        agresorLugar: Math.random() > 0.5 ? 'SI' : 'NO',
        armaFuego: Math.random() > 0.7 ? 'SI' : 'NO'
      },
      ubicacionNombre: randomCoords[coordIdx].addr,
      lat: randomCoords[coordIdx].lat,
      lng: randomCoords[coordIdx].lng,
      tags: ['CAMUFLAJE', 'NUEVA'],
      modoCamuflaje: true,
      notasOperador: '',
      mensajes: [
        { id: 1, autor: 'usuario', texto: 'Estoy en peligro', hora: timeStr, esGif: true }
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
