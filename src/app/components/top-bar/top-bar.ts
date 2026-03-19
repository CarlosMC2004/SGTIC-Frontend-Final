import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PeriodoService, Periodo } from '../../services/modelo-service/periodo.service';
import { ChatService } from '../../services/chat';
import { ChatMessage } from '../../models/chat-message';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.css']
})
export class Topbar implements OnInit {
  @Output() periodoChange = new EventEmitter<number>();

  periodosAceptados: Periodo[] = [];
  periodoSeleccionado: Periodo | null = null;
  isProfileMenuOpen = false;
  isPeriodMenuOpen = false;
  showNotificationDropdown = false;
  showChatAlert = false;
  unreadMessages_count = 0;
  unreadMessages: ChatMessage[] = [];

  constructor(
    private periodoService: PeriodoService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();

    this.chatService.unreadCount$.subscribe(count => {
      this.unreadMessages_count = count;
      this.showChatAlert = count > 0;
    });

    this.chatService.unreadMessages$.subscribe(messages => {
      this.unreadMessages = messages;
    });
  }

  goToChat() {
    this.chatService.clearUnread();
    this.showNotificationDropdown = false;
    this.router.navigate(['/chat/student']);
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
  }

  cargarPeriodos(): void {
    this.periodoService.getPeriodosAceptados().subscribe({
      next: (data: Periodo[]) => {
        this.periodosAceptados = data ?? [];
        if (this.periodosAceptados.length > 0) {
          this.periodoSeleccionado = this.periodosAceptados[0];
          this.periodoChange.emit(this.periodoSeleccionado.idPeriod);
        } else {
          this.periodoSeleccionado = null;
        }
      },
      error: (error) => {
        console.error('Error al cargar períodos:', error);
        this.periodosAceptados = [];
        this.periodoSeleccionado = null;
      }
    });
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isPeriodMenuOpen = false;
    this.showNotificationDropdown = false;
  }

  togglePeriodMenu(event: Event): void {
    event.stopPropagation();
    this.isPeriodMenuOpen = !this.isPeriodMenuOpen;
    this.isProfileMenuOpen = false;
    this.showNotificationDropdown = false;
  }

  seleccionarPeriodo(periodo: Periodo, cerrarMenu: boolean = true): void {
    this.periodoSeleccionado = periodo;
    if (cerrarMenu) this.isPeriodMenuOpen = false;
    this.periodoChange.emit(periodo.idPeriod);
  }

  trackByPeriodo(_: number, periodo: Periodo): number {
    return periodo.idPeriod;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
    this.showNotificationDropdown = false;
  }
}