import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client;
  private alertasSubject = new Subject<any>();

  constructor() {
    this.client = new Client({
      // Usar webSocketFactory para SockJS
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws-chat`),
      debug: (str) => {
        // Descomentar para ver logs de STOMP
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = (frame) => {
      console.log('Conectado a WebSockets', frame);
      this.client.subscribe('/topic/alertas', (message) => {
        if (message.body) {
          const alerta = JSON.parse(message.body);
          this.alertasSubject.next(alerta);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Error de STOMP', frame.headers['message']);
      console.error('Detalles:', frame.body);
    };

    this.client.activate();
  }

  getAlertas(): Observable<any> {
    return this.alertasSubject.asObservable();
  }
}
