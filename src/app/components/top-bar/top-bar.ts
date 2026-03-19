import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PeriodoService, Periodo } from '../../services/modelo-service/periodo.service';
import { ChatService } from '../../services/chat';
import { ChatMessage } from '../../models/chat-message';
import { AuthService } from '../../services/auth.service';
import { AdmissionRequestsService } from '../../services/admission-requests.service';
import { PendingProposalService } from '../../services/pending-proposal/pending-proposal';
import { TeacherAssignmentService } from '../../services/teacher-assignment/teacher-assignment.service';

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
  
  // Variables de notificaciones
  unreadMessages_count = 0;
  unreadMessages: ChatMessage[] = [];
  pendingRequestsCount = 0; 
  pendingProposalsCount = 0; 
  pendingAssignmentsCount = 0; // NUEVO: Contador de proyectos por asignar

  // Variables dinámicas para el usuario
  userName: string = 'Usuario';
  userRole: string = 'Rol no definido';
  isCoordinator: boolean = false;

  constructor(
    private periodoService: PeriodoService,
    private chatService: ChatService,
    private router: Router,
    private authService: AuthService,
    private admissionRequestsService: AdmissionRequestsService,
    private pendingProposalService: PendingProposalService,
    private teacherAssignmentService: TeacherAssignmentService // NUEVO: Inyectamos el servicio
  ) {}

  // AHORA SUMA LAS 4 COSAS (Chat + Solicitudes + Propuestas + Asignaciones)
  get totalNotifications(): number {
    return this.unreadMessages_count + this.pendingRequestsCount + this.pendingProposalsCount + this.pendingAssignmentsCount;
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarPeriodos();
    
    // Llamadas para llenar la campana
    this.cargarSolicitudesPendientes();
    this.cargarPropuestasPendientes(); 
    this.cargarAsignacionesPendientes(); // NUEVO: Llamamos al método de asignaciones

    this.chatService.unreadCount$.subscribe(count => {
      this.unreadMessages_count = count;
      this.showChatAlert = this.totalNotifications > 0;
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

  cargarSolicitudesPendientes(): void {
    if (this.isCoordinator) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.admissionRequestsService.getRequestsByCoordinator(userId).subscribe({
          next: (requests: any) => {
            const pendientes = requests.filter((r: any) => r.estado?.toLowerCase() === 'pendiente');
            this.pendingRequestsCount = pendientes.length;
          },
          error: (err: any) => console.error('Error al cargar solicitudes:', err)
        });
      }
    }
  }

  cargarPropuestasPendientes(): void {
    if (this.isCoordinator) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.pendingProposalService.getPendientes(userId).subscribe({
          next: (propuestas: any) => {
            this.pendingProposalsCount = propuestas ? propuestas.length : 0;
          },
          error: (err: any) => console.error('Error al cargar propuestas de temas:', err)
        });
      }
    }
  }

  // NUEVO: Método para buscar proyectos que necesitan director
  cargarAsignacionesPendientes(): void {
    if (this.isCoordinator) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.teacherAssignmentService.getPendingProjects(userId).subscribe({
          next: (proyectos: any) => {
            this.pendingAssignmentsCount = proyectos ? proyectos.length : 0;
          },
          error: (err: any) => console.error('Error al cargar proyectos por asignar:', err)
        });
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

  goToSolicitudes() {
    this.showNotificationDropdown = false;
    this.router.navigate(['coordinator/StudentRequests']); 
  }

  goToPropuestas() {
    this.showNotificationDropdown = false;
    this.router.navigate(['coordinator/BankThemes']); 
  }

  // NUEVO: Navegar a la pantalla de asignaciones
  goToAsignaciones() {
    this.showNotificationDropdown = false;
    // Ajusta esta ruta según cómo se llame en tu app.routes.ts (ej: '/asignaciones' o '/assignments')
    this.router.navigate(['coordinator/Assignments']); 
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
  }

  cargarPeriodos(): void {
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