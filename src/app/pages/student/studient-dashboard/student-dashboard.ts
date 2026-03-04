import { Component, OnInit, inject } from '@angular/core'; // IMPORTANTE: faltaba agregar 'inject' aquí
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import { StudentDashboard, DashboardStatus } from '../../../services/student-dashboard/student-dashboard'


@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, Topbar],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardd implements OnInit {
  // Ahora la inyección funciona perfectamente
  private dashboardService = inject(StudentDashboard);

  status: DashboardStatus | null = null;
  isLoading = true;

  entregables = [
    { 
      titulo: 'Capítulo 1: Introducción y Justificación', 
      fecha: '15 Oct, 2025', 
      icono: 'description' 
    },
    { 
      titulo: 'Diseño de la Metodología', 
      fecha: '30 Oct, 2025', 
      icono: 'bar_chart' 
    }
  ];

  tutorias = [
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

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.dashboardService.getStatus().subscribe({
      next: (data) => {
        this.status = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el progreso:', err);

        this.status = {
          temaSeleccionado: false,
          directorAsignado: false,
          procesoIniciado: false,
          tribunalAsignado: false,
          actaEntregada: false,
          finalizado: false,
          nombreTema: '',
          nombreDirector: ''
        };
        this.isLoading = false;
      }
    });
  }
}