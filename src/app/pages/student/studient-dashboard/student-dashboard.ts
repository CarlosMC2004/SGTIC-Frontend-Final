import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import { StudentDashboard, DashboardStatus } from '../../../services/student-dashboard/student-dashboard';

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
export class StudentDashboardd implements OnInit {
  private readonly dashboardService = inject(StudentDashboard);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  status: DashboardStatus | null = null;
  isLoading = true;
  
  // -- Variables para la Matrícula --
  mostrarModalMatricula = false;
  isEnrolling = false;
  estudianteId = 7; // TODO: Obtener dinámicamente del AuthService (ej. currentUser.id)
  
  // -- Variables del Dashboard --
  periodoSeleccionado = 1;
  totalTutoriasObligatorias = 5;
  tutoriasObligatoriasPeriodo: TutoriaObligatoria[] = [];

  tutorias: Tutoria[] = [
    { titulo: 'Revisión de Avances - Cap. 1', fechaMes: 'OCT', fechaDia: '12', hora: '10:00 AM - 11:00 AM', tipo: 'virtual' },
    { titulo: 'Taller de Normativa APA', fechaMes: 'OCT', fechaDia: '19', lugar: 'Auditorio Central', tipo: 'presencial' }
  ];

  get tutoriasCumplidas(): number {
    return this.tutoriasObligatoriasPeriodo.filter(t => t.cumplida).length;
  }

  ngOnInit(): void {
    this.cargarDashboard(this.periodoSeleccionado);
  }

  onPeriodoChange(periodoId: number): void {
    if (!periodoId || periodoId === this.periodoSeleccionado) return;
    this.periodoSeleccionado = periodoId;
    this.cargarDashboard(periodoId);
  }

  cargarDashboard(periodoId: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.dashboardService.getStatus(periodoId, this.estudianteId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.status = data;
          
          // Solo generamos las tutorías visuales si ESTÁ matriculado
          if (this.status.estaMatriculado) {
            this.generarTutoriasObligatorias(data.totalTutorias ?? 0);
          }
          
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar el progreso:', err);
        this.ngZone.run(() => {
          this.status = this.getEmptyStatus(); // Si falla, asumimos que no está matriculado
          this.generarTutoriasObligatorias(0);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // --- MÉTODOS PARA ACCIONES REQUERIDAS (NUEVOS) ---

  abrirModalTema(): void {
    // TODO: Aquí abriremos el modal o navegaremos a la pantalla de temas
    console.log('Solicitud para abrir el gestor de temas');
    alert('El gestor de temas está en construcción. ¡Aquí seleccionaremos la modalidad y el tema!');
  }

  abrirModalAnteproyecto(): void {
    // TODO: Aquí abriremos el modal para subir el documento
    console.log('Solicitud para entregar anteproyecto');
    alert('El gestor de entregables está en construcción.');
  }

  // --- MÉTODOS DEL MODAL DE MATRÍCULA ---

  abrirModalMatricula(): void {
    this.mostrarModalMatricula = true;
  }

  cerrarModalMatricula(): void {
    this.mostrarModalMatricula = false;
  }

  confirmarMatricula(): void {
    this.isEnrolling = true;
    
    const payload = {
      studentId: this.estudianteId,
      periodId: this.periodoSeleccionado
    };

    this.dashboardService.matricularEstudiante(payload).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.cerrarModalMatricula();
        // ¡Éxito! Recargamos el dashboard para mostrar el stepper ahora sí
        this.cargarDashboard(this.periodoSeleccionado);
      },
      error: (err) => {
        this.isEnrolling = false;
        alert('Error al matricular: ' + (err.error?.message || 'Revisa tu historial'));
      }
    });
  }

  // --- HELPERS ---

  private getEmptyStatus(): DashboardStatus {
    return {
      estaMatriculado: false,
      prerequisitosNivel1: false, temaSeleccionado: false, directorAsignado: false, reunionesMinimas: false, defensaAnteproyecto: false,
      prerequisitosNivel2: false, asistenciaTutorias: false, predefensa: false, defensaFinal: false,
      nombreTema: '', nombreDirector: '', nombreOpcion: '', totalTutorias: 0
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