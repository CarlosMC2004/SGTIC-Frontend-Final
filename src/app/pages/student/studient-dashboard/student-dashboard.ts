import { Component, OnInit, inject } from '@angular/core';
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

  status: DashboardStatus | null = null;
  isLoading = true;

  periodoSeleccionado = 1;
  totalTutoriasObligatorias = 5;
  tutoriasObligatoriasPeriodo: TutoriaObligatoria[] = [];

  tutorias: Tutoria[] = [
    {
      titulo: 'Revisión de Avances - Cap. 1',
      fechaMes: 'OCT',
      fechaDia: '12',
      hora: '10:00 AM - 11:00 AM',
      tipo: 'virtual'
    },
    {
      titulo: 'Taller de Normativa APA',
      fechaMes: 'OCT',
      fechaDia: '19',
      lugar: 'Auditorio Central',
      tipo: 'presencial'
    }
  ];

  get tutoriasCumplidas(): number {
    return this.tutoriasObligatoriasPeriodo.filter(t => t.cumplida).length;
  }

  ngOnInit(): void {
    this.cargarDashboard(this.periodoSeleccionado);
  }

  onPeriodoChange(periodoId: number): void {
    if (!periodoId || periodoId === this.periodoSeleccionado) {
      return;
    }

    this.periodoSeleccionado = periodoId;
    this.cargarDashboard(periodoId);
  }

  cargarDashboard(periodoId: number): void {
    this.isLoading = true;

    this.dashboardService.getStatus(periodoId).subscribe({
      next: (data) => {
        this.status = data;
        this.generarTutoriasObligatorias(data.totalTutorias ?? 0);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el progreso:', err);

        this.status = {
          prerequisitosNivel1: false,
          temaSeleccionado: false,
          directorAsignado: false,
          reunionesMinimas: false,
          defensaAnteproyecto: false,
          prerequisitosNivel2: false,
          asistenciaTutorias: false,
          predefensa: false,
          defensaFinal: false,
          nombreTema: '',
          nombreDirector: '',
          nombreOpcion: '',
          totalTutorias: 0
        };

        this.generarTutoriasObligatorias(0);
        this.isLoading = false;
      }
    });
  }

  private generarTutoriasObligatorias(totalCumplidas: number): void {
    const cumplidas = Math.max(0, Math.min(totalCumplidas, this.totalTutoriasObligatorias));

    this.tutoriasObligatoriasPeriodo = Array.from(
      { length: this.totalTutoriasObligatorias },
      (_, index) => {
        const numero = index + 1;
        const estaCumplida = numero <= cumplidas;

        return {
          id: numero,
          nombre: `Tutoría obligatoria ${numero}`,
          fechaTexto: estaCumplida ? 'Tutoría registrada' : 'Aún no registrada',
          cumplida: estaCumplida
        };
      }
    );
  }
}