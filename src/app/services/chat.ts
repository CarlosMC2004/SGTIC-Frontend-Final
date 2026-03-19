import { Injectable, NgZone } from '@angular/core';
import { ChatMessage } from '../models/chat-message';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any = null;
  private isConnected: boolean = false;
  private subscribedRooms: Set<string> = new Set();
  private backgroundSubscribed = false;
  private messageCallbacks: Map<string, ((message: ChatMessage) => void)[]> = new Map(); //  NUEVO

  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  private unreadMessagesList = new BehaviorSubject<ChatMessage[]>([]);
  unreadMessages$ = this.unreadMessagesList.asObservable();

  constructor(private ngZone: NgZone) {}

  isBackgroundSubscribed(): boolean {
    return this.backgroundSubscribed;
  }

  setBackgroundSubscribed(value: boolean): void {
    this.backgroundSubscribed = value;
  }

  incrementUnread(message?: ChatMessage) {
    this.unreadCount.next(this.unreadCount.value + 1);
    if (message) {
      this.unreadMessagesList.next([...this.unreadMessagesList.value, message]);
    }
  }

  clearUnread() {
    this.unreadCount.next(0);
    this.unreadMessagesList.next([]);
  }

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
            console.error('Error STOMP:', frame);
            this.isConnected = false;
            reject(frame);
          },
          onWebSocketError: (ev) => {
            console.error('Error WebSocket:', ev);
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
    //  Registrar callback siempre
    if (!this.messageCallbacks.has(roomId)) {
      this.messageCallbacks.set(roomId, []);
    }
    this.messageCallbacks.get(roomId)!.push(callback);

    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }

    if (this.stompClient && this.isConnected) {
      if (this.subscribedRooms.has(roomId)) {
        console.log(`Ya suscrito a sala: ${roomId}`);
        return;
      }
      this.subscribedRooms.add(roomId);
      console.log(`Suscribiendo a sala: ${roomId}`);
      this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
        try {
          const messageContent: ChatMessage = JSON.parse(message.body);
          this.ngZone.run(() => {
            //  Llamar TODOS los callbacks registrados para esta sala
            const callbacks = this.messageCallbacks.get(roomId) || [];
            callbacks.forEach(cb => cb(messageContent));
          });
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      console.log(`Suscrito a sala: ${roomId}`);
      console.log(`Suscrito a sala: ${roomId}`);
    }
  }

  async sendMessage(roomId: string, chatMessage: ChatMessage) {
    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }
    if (this.stompClient && this.isConnected) {
      console.log(`Enviando mensaje a sala ${roomId}:`, chatMessage);
      console.log(`Enviando mensaje a sala ${roomId}:`, chatMessage);
      this.stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify(chatMessage)
      });
    } else {
      console.error('No se pudo conectar para enviar el mensaje');
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected = false;
      this.subscribedRooms.clear();
      this.messageCallbacks.clear(); //  NUEVO
      this.backgroundSubscribed = false;
      console.log('Desconectado');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
