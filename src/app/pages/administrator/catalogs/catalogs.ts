import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PeriodoAcademico {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

interface CatalogRole {
  id: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  sistema: boolean; // Si es un rol del sistema (no se puede eliminar)
}

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogs.html',
  styleUrls: ['./catalogs.css']
})
export class CatalogsComponent {
  activeTab: 'periodos' | 'roles' = 'periodos';

  periodos: PeriodoAcademico[] = [
    {
      id: 1,
      nombre: '2024-2025',
      fechaInicio: '2024-09-01',
      fechaFin: '2025-02-28',
      activo: true
    },
    {
      id: 2,
      nombre: '2024-2025 (Intensivo)',
      fechaInicio: '2024-11-01',
      fechaFin: '2025-01-31',
      activo: false
    }
  ];

  roles: CatalogRole[] = [
    {
      id: 1,
      nombre: 'administrador_sgtic',
      descripcion: 'Administrador del Sistema de Gestión de Trabajos de Titulación',
      fechaCreacion: '2024-01-15',
      sistema: true
    },
    {
      id: 2,
      nombre: 'coordinador_facultad',
      descripcion: 'Coordinador académico a nivel de facultad',
      fechaCreacion: '2024-01-15',
      sistema: true
    },
    {
      id: 3,
      nombre: 'coordinador_carrera',
      descripcion: 'Coordinador académico a nivel de carrera',
      fechaCreacion: '2024-01-15',
      sistema: true
    },
    {
      id: 4,
      nombre: 'docente',
      descripcion: 'Personal docente y tutores',
      fechaCreacion: '2024-01-15',
      sistema: true
    },
    {
      id: 5,
      nombre: 'estudiante',
      descripcion: 'Estudiantes en proceso de titulación',
      fechaCreacion: '2024-01-15',
      sistema: true
    }
  ];

  newPeriodo = {
    nombre: '',
    fechaInicio: '',
    fechaFin: ''
  };

  togglePeriodoStatus(id: number) {
    const periodo = this.periodos.find(p => p.id === id);
    if (periodo) {
      periodo.activo = !periodo.activo;
    }
  }

  createPeriodo() {
    if (this.newPeriodo.nombre && this.newPeriodo.fechaInicio && this.newPeriodo.fechaFin) {
      this.periodos.push({
        id: this.periodos.length + 1,
        ...this.newPeriodo,
        activo: true
      });

      this.newPeriodo = {
        nombre: '',
        fechaInicio: '',
        fechaFin: ''
      };
    }
  }

  deleteRole(id: number) {
    this.roles = this.roles.filter(r => r.id !== id);
  }
}
