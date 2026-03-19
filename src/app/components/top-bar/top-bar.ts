import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PeriodoService, Periodo } from '../../services/modelo-service/periodo.service';
import { ChatService } from '../../services/chat';
import { ChatMessage } from '../../models/chat-message';
import { AuthService } from '../../services/auth.service';

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

  // Variables dinámicas para el usuario
  userName: string = 'Usuario';
  userRole: string = 'Rol no definido';
  isCoordinator: boolean = false;

  constructor(
    private periodoService: PeriodoService,
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarPeriodos();

    this.chatService.unreadCount$.subscribe(count => {
      this.unreadMessages_count = count;
      this.showChatAlert = count > 0;
    });

    this.chatService.unreadMessages$.subscribe(messages => {
      this.unreadMessages = messages;
    });
  }

  cargarDatosUsuario(): void {
    const user = this.authService.getCurrentUser();
    
    if (user) {
      this.userName = user.fullName || 'Usuario';
      
      if (this.authService.hasRole('COORDINADOR') || this.authService.hasRole('COORDINATOR') || this.authService.hasRole('ROLE_COORDINATOR') || this.authService.hasRole('administrador_sgtic') || this.authService.hasRole('coordinador_carrera')) {
        this.userRole = 'Coordinador';
        this.isCoordinator = true;
      } else if (this.authService.hasRole('ESTUDIANTE') || this.authService.hasRole('STUDENT') || this.authService.hasRole('ROLE_STUDENT') || this.authService.hasRole('estudiante')) {
        this.userRole = 'Estudiante';
        this.isCoordinator = false;
      } else if (user.roles && user.roles.length > 0) {
        this.userRole = user.roles[0];
      }
    }
  }

  goToChat() {
    this.chatService.clearUnread();
    this.showNotificationDropdown = false;
    if (this.isCoordinator) {
      this.router.navigate(['/chat/coordinator']); 
    } else {
      this.router.navigate(['/chat/student']);
    }
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
  }

  cargarPeriodos(): void {
    // TODOS los roles consultan la misma ruta para el periodo activo
    this.periodoService.getPeriodosActivos().subscribe({
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
        console.error('Error al cargar periodos activos:', error);
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

  logout(): void {
    this.authService.logout();
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
    this.showNotificationDropdown = false;
  }
}