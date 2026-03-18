import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header'; // Ajusta la ruta si es necesario
import { SidebarComponent } from '../../../components/sidebar/sidebar'; // Ajusta la ruta si es necesario
import { StatisticsReport } from '../../../services/statistics-report/statistics-report';
import { AuthService } from '../../../services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {

  // Variables para las tarjetas (KPIs)
  estadisticas: any = {
    temasAprobados: 0,
    temasPendientes: 0,
    temasRechazados: 0,
    totalTemas: 0,
    temasBanco: 0,
    temasPropuesta: 0
  };

  cantidadDirectores: number = 0;
  procesosRecientes: any[] = [];
  barChart: any;
  donutChart: any;

  constructor(
    private reportService: StatisticsReport,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idCarrera = this.authService.getCareerId();
    if (idCarrera) {
      this.cargarDatosDashboard(idCarrera);
    } else {
      console.error('Error: No se encontró el ID de la carrera.');
    }
  }

  cargarDatosDashboard(idCarrera: number): void {
    this.reportService.getEstadisticas(idCarrera).subscribe({
      next: (data) => {
        if (data) {
          this.estadisticas = data;
          this.renderizarGraficas();
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error en estadísticas:', err)
    });

    this.reportService.getDocentesReporte(idCarrera).subscribe({
      next: (data) => {
        this.cantidadDirectores = data.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error en docentes:', err)
    });

    this.reportService.getEstudiantesReporte(idCarrera).subscribe({
      next: (data) => {
        console.log('🎓 Estudiantes recibidos:', data);
        this.procesosRecientes = data.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error en estudiantes:', err)
    });
  }

  renderizarGraficas(): void {
    if (this.barChart) this.barChart.destroy();
    if (this.donutChart) this.donutChart.destroy();
    const ctxBar = document.getElementById('barChart') as HTMLCanvasElement;
    if (ctxBar) {
      this.barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: ['Aprobados', 'Pendientes', 'Rechazados'],
          datasets: [{
            label: 'Total de Temas',
            data: [
              this.estadisticas.temasAprobados,
              this.estadisticas.temasPendientes,
              this.estadisticas.temasRechazados
            ],
            backgroundColor: ['#1a5d43', '#f59e0b', '#ef4444'],
            borderRadius: 6,
            barThickness: 40,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const ctxDonut = document.getElementById('donutChart') as HTMLCanvasElement;
    if (ctxDonut) {
      this.donutChart = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: ['Banco de Temas', 'Propuesta Estudiante'],
          datasets: [{
            data: [
              this.estadisticas.temasBanco,
              this.estadisticas.temasPropuesta
            ],
            backgroundColor: ['#1a5d43', '#25805c'],
            hoverOffset: 4,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          }
        }
      });
    }
  }
}
