import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import { StudentDashboard, DashboardStatus } from '../../../services/student-dashboard/student-dashboard';
import { ChatService } from '../../../services/chat';

export interface TutoriaObligatoria {
  id: number;
  nombre: string;
  fechaTexto: string;
  cumplida: boolean;
}

interface Tutoria {
  titulo: string;
  fechaMes: string;
  fechaDia: string;
  hora?: string;
  lugar?: string;
  tipo: 'virtual' | 'presencial';
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, Topbar],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardd implements OnInit, OnDestroy {

  private readonly dashboardService = inject(StudentDashboard);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  status: DashboardStatus | null = null;
  isLoading = true;
  
  // Variables dinámicas para el usuario actual
  estudianteId: number = 0;
  usuarioActualEmail: string = '';
  
  periodoSeleccionado = 1;
  totalTutoriasObligatorias = 0;
  tutoriasObligatoriasPeriodo: TutoriaObligatoria[] = [];

  tutorias: Tutoria[] = [
    { titulo: 'Revisión de Avances - Cap. 1', fechaMes: 'OCT', fechaDia: '12', hora: '10:00 AM - 11:00 AM', tipo: 'virtual' },
    { titulo: 'Taller de Normativa APA', fechaMes: 'OCT', fechaDia: '19', lugar: 'Auditorio Central', tipo: 'presencial' }
  ];

  get tutoriasCumplidas(): number {
    return this.tutoriasObligatoriasPeriodo.filter(t => t.cumplida).length;
  }

  ngOnInit(): void {
    this.estudianteId = Number(localStorage.getItem('student_id')) || 0;
    this.usuarioActualEmail = localStorage.getItem('user_email') || '';

    if (this.estudianteId === 0) {
      console.warn('SGTIC: No se encontró el ID del estudiante en localStorage. Verifica el login.');
    }

    this.cargarDashboard(this.periodoSeleccionado);

    if (!this.chatService.isBackgroundSubscribed()) {
      this.chatService.setBackgroundSubscribed(true);
      this.chatService.initConnectionSocket().then(() => {
        ['student', 'coordinator'].forEach(sala => {
          this.chatService.joinRoom(sala, (message) => {
            if (message.user !== this.usuarioActualEmail) {
              this.chatService.incrementUnread(message);
            }
          });
        });
      }).catch(err => {
        console.warn('WebSocket no disponible en background:', err);
      });
    }
  }

  ngOnDestroy(): void {
  }
  
  contactarDirector(): void {
  this.router.navigate(['/chat/student']);
}

  onPeriodoChange(periodoId: number): void {
    if (!periodoId || periodoId === this.periodoSeleccionado) return;
    this.periodoSeleccionado = periodoId;
    this.cargarDashboard(periodoId);
  }

  cargarDashboard(periodoId: number): void {
    if (!this.estudianteId || this.estudianteId === 0) {
      this.isLoading = false;
      this.status = this.getEmptyStatus();
      this.cdr.detectChanges();
      return; 
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.dashboardService.getStatus(periodoId, this.estudianteId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.status = data;
          if (this.status.estaMatriculado) {
            this.totalTutoriasObligatorias = data.minimoTutorias || 0;
            this.generarTutoriasObligatorias(data.totalTutorias ?? 0);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar el progreso:', err);
        this.ngZone.run(() => {
          this.status = this.getEmptyStatus();
          this.totalTutoriasObligatorias = 0;
          this.generarTutoriasObligatorias(0);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  abrirModalTema(): void {
    console.log('Solicitud para abrir el gestor de temas');
    alert('El gestor de temas está en construcción.');
  }

  abrirModalAnteproyecto(): void {
    console.log('Solicitud para entregar anteproyecto');
    alert('El gestor de entregables está en construcción.');
  }

  private getEmptyStatus(): DashboardStatus {
    return {
      estaMatriculado: false,
      prerequisitosNivel1: false, temaSeleccionado: false, directorAsignado: false,
      defensaAnteproyecto: false, prerequisitosNivel2: false,
      asistenciaTutorias: false, predefensa: false, defensaFinal: false,
      nombreTema: '', nombreDirector: '', nombreOpcion: '', totalTutorias: 0, minimoTutorias: 0
    };
  }

  private generarTutoriasObligatorias(totalCumplidas: number): void {
    const cumplidas = Math.max(0, Math.min(totalCumplidas, this.totalTutoriasObligatorias));
    this.tutoriasObligatoriasPeriodo = Array.from({ length: this.totalTutoriasObligatorias }, (_, index) => {
      const numero = index + 1;
      const estaCumplida = numero <= cumplidas;
      return {
        id: numero,
        nombre: `Tutoría obligatoria ${numero}`,
        fechaTexto: estaCumplida ? 'Tutoría registrada' : 'Aún no registrada',
        cumplida: estaCumplida
      };
    });
  }
}