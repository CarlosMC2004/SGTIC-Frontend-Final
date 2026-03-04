import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalPeriodoComponent } from '../../../components/modal-periodo/modal-periodo.component';
import { PeriodoService } from '../../../services/modelo-service/periodo.service';

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
  sistema: boolean;
}

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalPeriodoComponent],
  templateUrl: './catalogs.html',
  styleUrls: ['./catalogs.css']
})
export class CatalogsComponent implements OnInit {
  @ViewChild(ModalPeriodoComponent) modalComponent!: ModalPeriodoComponent;
  
  activeTab: 'periodos' | 'roles' = 'periodos';

  showPeriodoModal = false;
  selectedPeriodo: any = null;
  isModalSaving = false;

  periodos: PeriodoAcademico[] = [];
  
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

  constructor(private periodoService: PeriodoService) {}

  ngOnInit() {
    this.loadPeriodos();
  }

  loadPeriodos() {
    console.log('Cargando períodos...');
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
        console.log('Períodos cargados:', data);
        this.periodos = data.map((p: any) => ({
          id: p.idPeriod,
          nombre: p.name,
          fechaInicio: p.startDate,
          fechaFin: p.endDate,
          activo: p.active
        }));
      },
      error: (err) => {
        console.error('Error cargando períodos:', err);
      }
    });
  }

  openPeriodoModal(periodo?: any) {
    if (periodo) {
      this.selectedPeriodo = {
        id: periodo.id,
        name: periodo.nombre,
        startDate: periodo.fechaInicio,
        endDate: periodo.fechaFin,
        active: periodo.activo
      };
    } else {
      this.selectedPeriodo = null;
    }
    this.showPeriodoModal = true;
  }

  closePeriodoModal() {
    if (!this.isModalSaving) {
      this.showPeriodoModal = false;
      this.selectedPeriodo = null;
    }
  }

  onModalSaving(saving: boolean) {
    this.isModalSaving = saving;
  }

  handlePeriodoSave(periodoData: any) {
    console.log('Datos recibidos del modal:', periodoData);
    
    const periodoBackend = {
      name: periodoData.name,
      startDate: periodoData.startDate,
      endDate: periodoData.endDate,
      active: periodoData.id ? periodoData.active : true,
      enrollmentDeadline: periodoData.startDate
    };

    console.log('Enviando al backend:', periodoBackend);
    
    const request = periodoData.id 
      ? this.periodoService.updatePeriodo(periodoData.id, periodoBackend)
      : this.periodoService.createPeriodo(periodoBackend);

    request.subscribe({
      next: (response) => {
        console.log('Operación exitosa:', response);
        this.loadPeriodos();
        setTimeout(() => {
          if (this.modalComponent) {
            this.modalComponent.resetSavingState();
          }
          this.showPeriodoModal = false;
          this.selectedPeriodo = null;
        }, 300);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al guardar el período: ' + (err.error?.message || 'Error desconocido'));
        if (this.modalComponent) {
          this.modalComponent.resetSavingState();
        }
      }
    });
  }

  togglePeriodoStatus(id: number) {
    const periodo = this.periodos.find(p => p.id === id);
    if (periodo && !this.isModalSaving) {
      const estadoAnterior = periodo.activo;
      periodo.activo = !periodo.activo;
      
      const periodoActualizado = {
        name: periodo.nombre,
        startDate: periodo.fechaInicio,
        endDate: periodo.fechaFin,
        active: periodo.activo,
        enrollmentDeadline: periodo.fechaInicio
      };
      
      this.periodoService.updatePeriodo(id, periodoActualizado).subscribe({
        error: (err) => {
          console.error('Error actualizando estado:', err);
          periodo.activo = estadoAnterior;
          alert('Error al actualizar el estado');
        }
      });
    }
  }

  deleteRole(id: number) {
    if(confirm('¿Estás seguro que quieres eliminar este rol?')) {
      this.roles = this.roles.filter(r => r.id !== id);
    }
  }
}