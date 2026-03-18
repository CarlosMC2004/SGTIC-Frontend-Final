import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../services/chat';
import { ChatMessage } from '../../models/chat-message';

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

  private usuarios: { [key: number]: string } = {
    13: 'jperezg@uteq.edu.ec',
    15: 'coordf1@uteq.edu.ec',
  };

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private ngZone: NgZone,
    private location: Location,  //  agregar
    private cdr: ChangeDetectorRef //  agregado
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomId = params['id'] || 'general';

      if (this.roomId === 'coordinator') {
        this.userName = 'coordf1@uteq.edu.ec';
        this.userRole = 'coordinador';
      } else {
        this.userName = 'jperezg@uteq.edu.ec';
        this.userRole = 'estudiante';
      }

      this.cargarHistorial();

      setTimeout(() => {
        this.connectToChat();
      }, 0);
    });
  }

  cargarHistorial() {
  this.http.get<any[]>('http://localhost:8080/api/chat/historial')
    .subscribe({
      next: (historial) => {
        this.ngZone.run(() => {
          this.messages = historial.map(item => {
            let userEmail = this.usuarios[item.idRemitente] || `usuario_${item.idRemitente}@uteq.edu.ec`;

            const message: ChatMessage = {
              id: item.id,
              message: item.mensaje,
              user: userEmail,
              timestamp: new Date(item.fechaEnvio)
            };

            if (item.replyToId) {
              const repliedMessage = historial.find(m => m.id === item.replyToId);
              if (repliedMessage) {
                message.replyTo = {
                  id: item.replyToId,
                  message: repliedMessage.mensaje,
                  user: this.usuarios[repliedMessage.idRemitente] || `usuario_${repliedMessage.idRemitente}@uteq.edu.ec`
                };
              }
            }

            return message;
          });

          // ✅ Fuerza repintado y scroll al fondo
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      },
      error: (error) => {
        console.error('❌ Error cargando historial:', error);
      }
    });
}

// ✅ Nuevo método
private scrollToBottom() {
  setTimeout(() => {
    const area = document.querySelector('.messages-area');
    if (area) area.scrollTop = area.scrollHeight;
  }, 50);
}

  async connectToChat() {
    try {
      await this.chatService.initConnectionSocket();

      //  ngZone + cdr.detectChanges() garantizan que Angular pinte el cambio
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
    if (this.userRole === 'coordinador') {
      ['student', 'coordinator', 'general'].forEach(sala => {
        this.chatService.joinRoom(sala, (message: ChatMessage) => {
          this.ngZone.run(() => {
            this.messages = [...this.messages, message];
          });
        });
      });
    } else {
      this.chatService.joinRoom(this.roomId, (message: ChatMessage) => {
        this.ngZone.run(() => {
          this.messages = [...this.messages, message];
        });
      });
    }
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
        user: this.userName,
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
    this.chatService.disconnect();
  }
  
  goBack(): void {
  this.location.back();
}
}