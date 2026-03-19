import { Injectable, NgZone } from '@angular/core';
import { ChatMessage } from '../models/chat-message';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any = null;
  private isConnected: boolean = false;
  private subscribedRooms: Map<string, any> = new Map();
  private backgroundSubscribed = false;
  private messageCallbacks: Map<string, ((message: ChatMessage) => void)[]> = new Map();

  // ← nueva variable para saber qué sala está abierta actualmente
  private activeChatRoomId: string | null = null;

  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  private unreadMessagesList = new BehaviorSubject<ChatMessage[]>([]);
  unreadMessages$ = this.unreadMessagesList.asObservable();

  constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  isBackgroundSubscribed(): boolean { return this.backgroundSubscribed; }
  setBackgroundSubscribed(value: boolean): void { this.backgroundSubscribed = value; }

  // ← llamar esto cuando el usuario abre una sala
  setActiveChatRoom(roomId: string | null) {
    this.activeChatRoomId = roomId;
  }

  incrementUnread(message?: ChatMessage, roomId?: string) {
    if (message) {
      const currentUser = this.authService.getCurrentUser();
      const myEmail = currentUser?.email;

      // No contar si el mensaje es mío
      if (message.user === myEmail) return;

      // No contar si el chat de esa sala está abierto actualmente
      if (roomId && roomId === this.activeChatRoomId) return;
    }

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
        const SockJS = (await import('sockjs-client')).default;
        const { Client } = await import('@stomp/stompjs');

        this.stompClient = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/chat-socket'),
          reconnectDelay: 5000,
          debug: () => {},
          onConnect: () => {
            console.log('✅ Conectado al WebSocket');
            this.isConnected = true;
            resolve();
          },
          onStompError: (frame: any) => {
            console.error('❌ Error STOMP:', frame);
            this.isConnected = false;
            reject(frame);
          },
          onWebSocketError: (ev: any) => {
            console.error('❌ Error WebSocket:', ev);
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

  // ← suscripción en background para la campana (sin callback de UI)
  async subscribeToRoomBackground(roomId: string) {
    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }

    if (this.subscribedRooms.has(roomId)) return;

    const subscription = this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
      try {
        const messageContent: ChatMessage = JSON.parse(message.body);
        this.ngZone.run(() => {
          this.incrementUnread(messageContent, roomId);
        });
      } catch (error) {
        console.error('Error parsing message background:', error);
      }
    });

    this.subscribedRooms.set(roomId, subscription);
    console.log(`🔔 Escuchando en background sala: ${roomId}`);
  }

  async joinRoom(roomId: string, callback: (message: ChatMessage) => void) {
    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }

    // Marcar esta sala como activa
    this.setActiveChatRoom(roomId);

    if (this.subscribedRooms.has(roomId)) {
      const sub = this.subscribedRooms.get(roomId);
      sub?.unsubscribe();
      this.subscribedRooms.delete(roomId);
    }

    this.messageCallbacks.set(roomId, [callback]);

    const subscription = this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
      try {
        const messageContent: ChatMessage = JSON.parse(message.body);
        this.ngZone.run(() => {
          // roomId activo → no cuenta en campana, solo muestra en chat
          this.incrementUnread(messageContent, roomId);
          const callbacks = this.messageCallbacks.get(roomId) || [];
          callbacks.forEach(cb => cb(messageContent));
        });
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscribedRooms.set(roomId, subscription);
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
      this.activeChatRoomId = null;
      console.log('Desconectado');
    }
  }

  getConnectionStatus(): boolean { return this.isConnected; }
}