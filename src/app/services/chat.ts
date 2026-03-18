import { Injectable, NgZone } from '@angular/core';
import { ChatMessage } from '../models/chat-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any = null;
  private isConnected: boolean = false;

  constructor(private ngZone: NgZone) {}

  async initConnectionSocket(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Inicializando conexión WebSocket...');

        const SockJS = (await import('sockjs-client')).default;
        const { Client } = await import('@stomp/stompjs');  // 👈 Client, no Stomp

        this.stompClient = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/chat-socket'),
          reconnectDelay: 5000,
          debug: () => {},

          onConnect: () => {
            console.log('✅ Conectado al WebSocket');
            this.isConnected = true;
            resolve();
          },

          onStompError: (frame) => {
            console.error('❌ Error STOMP:', frame);
            this.isConnected = false;
            reject(frame);
          },

          onWebSocketError: (ev) => {
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

  async joinRoom(roomId: string, callback: (message: ChatMessage) => void) {
    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }

    if (this.stompClient && this.isConnected) {
      console.log(`👥 Suscribiendo a sala: ${roomId}`);

      this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
        try {
          const messageContent: ChatMessage = JSON.parse(message.body);
          this.ngZone.run(() => callback(messageContent));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      console.log(`✅ Suscrito a sala: ${roomId}`);
    }
  }

  async sendMessage(roomId: string, chatMessage: ChatMessage) {
    if (!this.stompClient || !this.isConnected) {
      await this.initConnectionSocket();
    }

    if (this.stompClient && this.isConnected) {
      console.log(`📤 Enviando mensaje a sala ${roomId}:`, chatMessage);
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
      console.log('🔌 Desconectado');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}