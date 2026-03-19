import { Injectable, NgZone } from '@angular/core';
import { ChatMessage } from '../models/chat-message';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service'; // <--- NUEVO: Importamos el servicio de auth

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any = null;
  private isConnected: boolean = false;
  private subscribedRooms: Set<string> = new Set();
  private backgroundSubscribed = false;
  private messageCallbacks: Map<string, ((message: ChatMessage) => void)[]> = new Map();

  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  private unreadMessagesList = new BehaviorSubject<ChatMessage[]>([]);
  unreadMessages$ = this.unreadMessagesList.asObservable();

  // Inyectamos el AuthService en el constructor
  constructor(private ngZone: NgZone, private authService: AuthService) {}

  isBackgroundSubscribed(): boolean {
    return this.backgroundSubscribed;
  }

  setBackgroundSubscribed(value: boolean): void {
    this.backgroundSubscribed = value;
  }

  incrementUnread(message?: ChatMessage) {
    // --- FILTRO DE SEGURIDAD ---
    if (message) {
      const currentUser = this.authService.getCurrentUser();
      const myEmail = currentUser?.email || currentUser?.fullName;

      // Si el que mandó el mensaje soy YO, salimos de la función sin contar nada
      if (message.user === myEmail) {
        return;
      }
    }
    // ---------------------------

    this.unreadCount.next(this.unreadCount.value + 1);
    if (message) {
      this.unreadMessagesList.next([...this.unreadMessagesList.value, message]);
    }
  }

  clearUnread() {
    this.unreadCount.next(0);
    this.unreadMessagesList.next([]);
  }

  // ... (Resto del código initConnectionSocket, joinRoom, sendMessage, etc., se mantienen igual)

  async initConnectionSocket(): Promise<void> {
    if (this.isConnected && this.stompClient) {
      console.log('Ya conectado, reutilizando conexión');
      return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
      try {
        console.log('Inicializando conexión WebSocket...');
        const SockJS = (await import('sockjs-client')).default;
        const { Client } = await import('@stomp/stompjs');

        this.stompClient = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/chat-socket'),
          reconnectDelay: 5000,
          debug: () => {},
          onConnect: () => {
            console.log('Conectado al WebSocket');
            this.isConnected = true;
            resolve();
          },
          onStompError: (frame) => {
            console.error('Error STOMP:', frame);
            this.isConnected = false;
            reject(frame);
          },
          onWebSocketError: (ev) => {
            console.error('Error WebSocket:', ev);
            this.isConnected = false;
            reject(ev);
          }
        });

        this.stompClient.activate();
      } catch (error) {
        console.error('Error inicializando WebSocket:', error);
        reject(error);
      }
    });
  }

  async joinRoom(roomId: string, callback: (message: ChatMessage) => void) {
    // 1. Registro de callbacks para que el componente vea el mensaje
    if (!this.messageCallbacks.has(roomId)) {
      this.messageCallbacks.set(roomId, []);
    }
    
    // Solo agregamos el callback si no existe ya uno igual (o limpiamos los anteriores)
    this.messageCallbacks.set(roomId, [callback]);

    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }

    // 2. LA CLAVE: Evitar múltiples suscripciones al mismo tópico de red
    if (this.subscribedRooms.has(roomId)) {
      console.log(`Ya escuchando en red la sala: ${roomId}. No duplicamos.`);
      return; 
    }

    this.subscribedRooms.add(roomId);

    this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
      try {
        const messageContent: ChatMessage = JSON.parse(message.body);
        
        this.ngZone.run(() => {
          // AQUÍ es donde se debe incrementar, UNA SOLA VEZ por mensaje de red
          // El filtro de "si soy yo" que pusimos antes evitará que tú te cuentes.
          this.incrementUnread(messageContent);

          // Notificar a los componentes que estén abiertos
          const callbacks = this.messageCallbacks.get(roomId) || [];
          callbacks.forEach(cb => cb(messageContent));
        });
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  async sendMessage(roomId: string, chatMessage: ChatMessage) {
    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }
    if (this.stompClient && this.isConnected) {
      this.stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify(chatMessage)
      });
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected = false;
      this.subscribedRooms.clear();
      this.messageCallbacks.clear();
      this.backgroundSubscribed = false;
      console.log('Desconectado');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}