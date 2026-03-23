import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Topbar } from '../../../components/top-bar/top-bar';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { TutorshipService } from '../../../services/tutorship/tutorship';
import {FormGroup, FormsModule} from '@angular/forms';

@Component({
  selector: 'app-director-dashboard',
  standalone: true,
  imports: [CommonModule, Topbar, SidebarComponent, FormsModule],
  templateUrl: './director-dashboard.html',
  styleUrls: ['./director-dashboard.css']
})
export class DirectorDashboardComponent implements OnInit {

  private tutorshipService = inject(TutorshipService);
  private cdr = inject(ChangeDetectorRef);
  userName = "Director de TIC";

  estudiantesAsignados: any[] = [];
  proximasAsesorias: any[] = [];

  filterStatus: string = 'all';

  stats = {
    totalEstudiantes: 0,
    ticActivos: 0,
    asesoriasPendientes: 0,
    proximaAsesoria: 'No programada'
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.tutorshipService.getAssignedWorks().subscribe({
      next: (data) => {
        this.estudiantesAsignados = data.map(work => ({
          ...work,
          avatar: this.getInitials(work.studentName),
          estado: 'activo',
          fase: 'En Ejecución',
          progreso: Math.floor(Math.random() * 40) + 10
        }));

        this.stats.totalEstudiantes = this.estudiantesAsignados.length;
        this.stats.ticActivos = this.estudiantesAsignados.length;
        this.cdr.detectChanges();
      }
    });

    // 2. Cargar Tutorías (Para el panel lateral derecho)
    this.tutorshipService.getMyTutorships().subscribe({
      next: (tutorships) => {
        this.proximasAsesorias = tutorships.filter(t => t.status !== 'completed');
        this.stats.asesoriasPendientes = this.proximasAsesorias.length;
        if (this.proximasAsesorias.length > 0) {
          const prox = this.proximasAsesorias[0];
          this.stats.proximaAsesoria = `${prox.date} - ${prox.modality}`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  get filteredEstudiantes() {
    if (this.filterStatus === 'all') return this.estudiantesAsignados;
    return this.estudiantesAsignados.filter(e => e.estado === this.filterStatus);
  }

  getInitials(name: string): string {
    if (!name) return 'ST';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  getFaseColor(fase: string): string {
    const colors: any = { 'Propuesta': '#7F77DD', 'En Ejecución': '#378ADD', 'Predefensa': '#D85A30' };
    return colors[fase] || '#378ADD';
  }
}
