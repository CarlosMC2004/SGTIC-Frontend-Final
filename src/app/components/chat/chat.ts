import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../services/chat';
import { ChatMessage } from '../../models/chat-message';
// NUEVO: Importamos el AuthService para saber quién está logueado
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  messages: ChatMessage[] = [];
  newMessage: string = '';
  userName: string = '';
  roomId: string = 'general';
  userRole: string = 'estudiante';
  isConnected: boolean = false;
  connectionError: string = '';
  replyToMessage: ChatMessage | null = null;

  // Nota: Esto sigue sirviendo para el historial viejo, pero los nuevos 
  // mensajes usarán la identidad real del usuario conectado.
  

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private ngZone: NgZone,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private authService: AuthService // NUEVO: Inyectamos el servicio aquí
  ) {}

  ngOnInit() {
    this.chatService.clearUnread();

    this.route.params.subscribe(params => {
      this.roomId = params['id'] || 'general';

      // NUEVO: En lugar de asignar nombres estáticos, llamamos a la función
      this.cargarDatosUsuario();

      this.cargarHistorial();

      setTimeout(() => {
        this.connectToChat();
      }, 0);
    });
  }

  // NUEVO: Función que extrae los datos reales del usuario
  cargarDatosUsuario(): void {
    const user = this.authService.getCurrentUser();
    
    if (user) {
      // Intentamos tomar el email o username. Ajusta 'email' o 'correo' según 
      // cómo venga tu objeto de usuario desde el backend.
      this.userName = user.email || user.fullName || 'Usuario Desconocido';

      // Asignamos el rol real
      if (this.authService.hasRole('COORDINADOR') || this.authService.hasRole('COORDINATOR') || this.authService.hasRole('ROLE_COORDINATOR') || this.authService.hasRole('administrador_sgtic') || this.authService.hasRole('coordinador_carrera')) {
        this.userRole = 'coordinador';
      } else {
        this.userRole = 'estudiante';
      }
    }
  }

  cargarHistorial() {
    this.http.get<any[]>('http://localhost:8080/api/chat/historial')
      .subscribe({
        next: (historial) => {
          this.ngZone.run(() => {
            this.messages = historial.map(item => {
              
              // AHORA TOMAMOS EL CORREO REAL DIRECTO DEL BACKEND
              let userEmail = item.correoRemitente || `usuario_${item.idRemitente}@uteq.edu.ec`;

              const message: ChatMessage = {
                id: item.id,
                message: item.mensaje,
                user: userEmail,
                timestamp: new Date(item.fechaEnvio)
              };

              // Si el mensaje es una respuesta a otro, también le ponemos su correo real
              if (item.replyToId) {
                const repliedMessage = historial.find((m: any) => m.id === item.replyToId);
                if (repliedMessage) {
                  message.replyTo = {
                    id: item.replyToId,
                    message: repliedMessage.mensaje,
                    user: repliedMessage.correoRemitente || `usuario_${repliedMessage.idRemitente}@uteq.edu.ec`
                  };
                }
              }

              return message;
            });

            this.cdr.detectChanges();
            this.scrollToBottom();
          });
        },
        error: (error) => {
          console.error(' Error cargando historial:', error);
        }
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const area = document.querySelector('.messages-area');
      if (area) area.scrollTop = area.scrollHeight;
    }, 50);
  }

  async connectToChat() {
    try {
      await this.chatService.initConnectionSocket();
      this.ngZone.run(() => {
        this.isConnected = true;
        this.connectionError = '';
        this.cdr.detectChanges();
      });
      this.joinRoom();
    } catch (error) {
      console.error('Error de conexión:', error);
      this.ngZone.run(() => {
        this.isConnected = false;
        this.connectionError = 'No se pudo conectar al servidor.';
        this.cdr.detectChanges();
      });
    }
  }

  joinRoom() {
    const salas = this.userRole === 'coordinador' ? ['student', 'coordinator', 'general'] : [this.roomId];
    
    salas.forEach(sala => {
      this.chatService.joinRoom(sala, (message: ChatMessage) => {
        this.ngZone.run(() => {
          // SOLO actualizamos la lista visual de mensajes
          // El contador de la campana ya lo manejó el servicio arriba
          this.messages = [...this.messages, message];
          this.scrollToBottom();
        });
      });
    });
  }

  setReplyTo(message: ChatMessage) {
    this.replyToMessage = message;
    setTimeout(() => {
      const input = document.querySelector('.message-input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  cancelReply() {
    this.replyToMessage = null;
  }

  scrollToMessage(messageId?: number) {
    if (!messageId) return;
    setTimeout(() => {
      const element = document.getElementById(`msg-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight');
        setTimeout(() => element.classList.remove('highlight'), 2000);
      }
    }, 100);
  }

  async sendMessage() {
    if (this.newMessage.trim() && this.isConnected) {
      const chatMessage: ChatMessage = {
        message: this.newMessage,
        user: this.userName, // AHORA TOMA LA IDENTIDAD REAL
        timestamp: new Date()
      };

      if (this.replyToMessage) {
        chatMessage.replyTo = {
          id: this.replyToMessage.id || 0,
          message: this.replyToMessage.message,
          user: this.replyToMessage.user
        };
      }

      await this.chatService.sendMessage(this.roomId, chatMessage);

      this.ngZone.run(() => {
        this.newMessage = '';
        this.replyToMessage = null;
      });
    }
  }

  ngOnDestroy() {
    // No desconectar para mantener notificaciones activas en background
    // this.chatService.disconnect();
  }

  goBack(): void {
    this.location.back();
  }
}