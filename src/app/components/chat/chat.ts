import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../services/chat';
import { ChatMessage } from '../../models/chat-message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  userName: string = '';
  isConnected: boolean = false;
  roomId: string = '';

  coordinadores: any[] = [];
  nombreDestinatario: string = '';
  idConversacionActual: number = 0;
  replyToMessage: ChatMessage | null = null;

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private ngZone: NgZone,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatosUsuario();
    this.connectToChat();
  }

  // ← al salir del chat, limpia la sala activa para que la campana vuelva a funcionar
  ngOnDestroy() {
    this.chatService.setActiveChatRoom(null);
  }

  cargarDatosUsuario(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.email) {
      this.userName = user.email;
      this.cargarListaContactos();
    }
  }

  cargarListaContactos() {
    const user = this.authService.getCurrentUser();
    const roles: string[] = user?.roles?.map((r: any) =>
      typeof r === 'string' ? r : r.name || r.nombre || ''
    ) || [];

    const esCoordinadorODirector = roles.some(r =>
      r === 'coordinador_facultad' ||
      r === 'coordinador_carrera' ||
      r === 'director_trabajo_titulacion'
    );

    const emailEncoded = encodeURIComponent(this.userName);

    const url = esCoordinadorODirector
      ? `http://localhost:8080/api/usuarios/mis-estudiantes?emailCoordinador=${emailEncoded}`
      : `http://localhost:8080/api/usuarios/coordinadores?emailEstudiante=${emailEncoded}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.coordinadores = data.filter(c => c.idConversacion !== null);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar contactos:', err)
    });
  }

  seleccionarConversacion(idConv: number, nombre: string) {
    // Limpiar notificaciones al abrir una conversación
    this.chatService.clearUnread();

    this.idConversacionActual = idConv;
    this.nombreDestinatario = nombre;
    this.roomId = `conv_${idConv}`;
    this.messages = [];
    this.replyToMessage = null;

    this.cargarHistorial(idConv);

    // joinRoom marca esta sala como activa → campana no cuenta mensajes de esta sala
    this.chatService.joinRoom(this.roomId, (message: ChatMessage) => {
      this.ngZone.run(() => {
        this.messages = [...this.messages, message];
        this.scrollToBottom();
        this.cdr.detectChanges();
      });
    });
  }

  cargarHistorial(id: number) {
    this.http.get<any[]>(`http://localhost:8080/api/chat/historial/${id}`)
      .subscribe({
        next: (historial) => {
          this.messages = historial.map(item => ({
            id: item.id,
            message: item.mensaje,
            user: item.correoRemitente,
            idConversacion: item.idConversacion,
            timestamp: new Date(item.fechaEnvio),
            replyTo: item.replyToId ? {
              id: item.replyToId,
              message: item.replyToMessage,
              user: item.replyToUser
            } : undefined
          }));
          this.cdr.detectChanges();
          this.scrollToBottom();
        },
        error: (err) => console.error('Error al cargar historial:', err)
      });
  }

  async connectToChat() {
    try {
      await this.chatService.initConnectionSocket();
      this.isConnected = true;
    } catch (e) {
      console.error('Error WebSocket:', e);
    }
  }

  async sendMessage() {
    if (this.idConversacionActual === 0 || !this.newMessage.trim() || !this.isConnected) return;

    const chatMessage: ChatMessage = {
      message: this.newMessage,
      user: this.userName,
      idConversacion: this.idConversacionActual,
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
    this.newMessage = '';
    this.replyToMessage = null;
    this.scrollToBottom();
  }

  setReplyTo(message: ChatMessage) { this.replyToMessage = message; }
  cancelReply() { this.replyToMessage = null; }

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  scrollToMessage(id?: number) {
    if (!id) return;
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-message');
      setTimeout(() => element.classList.remove('highlight-message'), 2000);
    }
  }

  goBack(): void { this.location.back(); }
}