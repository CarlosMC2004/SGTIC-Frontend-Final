// src/app/services/chat.ts
import { Injectable, NgZone } from '@angular/core';
import { ChatMessage } from '../models/chat-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any = null;
  private isConnected: boolean = false;
  
  constructor(private ngZone: NgZone) { // ✅ Esto está bien
    // No inicializar aquí, hacerlo bajo demanda
  }

  async initConnectionSocket(): Promise<void> {
    try {
      console.log('🔄 Inicializando conexión WebSocket...');
      
      // Importación dinámica
      const SockJS = (await import('sockjs-client')).default;
      const { Stomp } = await import('@stomp/stompjs');
      
      const url = 'http://localhost:8080/chat-socket';
      console.log('📡 Conectando a:', url);
      
      const socket = new SockJS(url);
      this.stompClient = Stomp.over(socket);
      
      // Desactivar logs detallados de STOMP
      this.stompClient.debug = () => {};
      
      return new Promise((resolve, reject) => {
        this.stompClient.onConnect = (frame: any) => {
          console.log('✅ Conectado al WebSocket');
          this.isConnected = true;
          resolve();
        };
        
        this.stompClient.onStompError = (frame: any) => {
          console.error('❌ Error STOMP:', frame);
          this.isConnected = false;
          reject(frame);
        };
        
        this.stompClient.onWebSocketError = (ev: any) => {
          console.error('❌ Error WebSocket:', ev);
          this.isConnected = false;
          reject(ev);
        };
        
        this.stompClient.activate();
      });
      
    } catch (error) {
      console.error('Error inicializando WebSocket:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string, callback: (message: ChatMessage) => void) {
    if (!this.stompClient || !this.isConnected) {
      console.log('Conectando antes de unirse a la sala...');
      await this.initConnectionSocket();
    }
    
    if (this.stompClient && this.isConnected) {
      console.log(`👥 Suscribiendo a sala: ${roomId}`);
      
      this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
        try {
          const messageContent: ChatMessage = JSON.parse(message.body);
          console.log('📨 Mensaje recibido:', messageContent);
          
          // Usar NgZone para asegurar que Angular detecta los cambios
          this.ngZone.run(() => {
            callback(messageContent);
          });
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      console.log(`✅ Suscrito a sala: ${roomId}`);
    }
  }

  async sendMessage(roomId: string, chatMessage: ChatMessage) {
    if (!this.stompClient || !this.isConnected) {
      console.log('Conectando antes de enviar mensaje...');
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
    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      console.log('🔌 Desconectado del WebSocket');
    }
  }

  // Método para verificar estado
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}