import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalPeriodoComponent } from '../../../components/modal-periodo/modal-periodo.component';
import { PeriodoService } from '../../../services/modelo-service/periodo.service';
import { ToastMensajeComponent } from '../../../components/Toast/toast-mensaje.component';

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
  imports: [CommonModule, FormsModule, ModalPeriodoComponent, ToastMensajeComponent],
  templateUrl: './catalogs.html',
  styleUrls: ['./catalogs.css']
})
export class CatalogsComponent implements OnInit {
  @ViewChild(ModalPeriodoComponent) modalComponent!: ModalPeriodoComponent;
  @ViewChild('toast') toast!: ToastMensajeComponent;
  
  activeTab: 'periodos' | 'roles' = 'periodos';

  showPeriodoModal = false;
  selectedPeriodo: any = null;

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

  get periodosActivos(): number {
    return this.periodos.filter(p => p.activo).length;
  }

  get periodosInactivos(): number {
    return this.periodos.filter(p => !p.activo).length;
  }

  constructor(private periodoService: PeriodoService) {}

  ngOnInit() {
    this.loadPeriodos();
  }

  mostrarToast(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    setTimeout(() => {
      if (this.toast) {
        this.toast.mostrarToast(mensaje, tipo);
      }
    });
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
        this.mostrarToast('❌ Error al cargar los períodos', 'error');
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
      console.log('Editando período:', this.selectedPeriodo);
    } else {
      this.selectedPeriodo = null;
      console.log('Creando nuevo período');
    }
    this.showPeriodoModal = true;
  }

  closePeriodoModal() {
    this.showPeriodoModal = false;
    this.selectedPeriodo = null;
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

    const request = periodoData.id 
      ? this.periodoService.updatePeriodo(periodoData.id, periodoBackend)
      : this.periodoService.createPeriodo(periodoBackend);

    request.subscribe({
      next: (response: any) => {
        console.log('Operación exitosa:', response);
        this.loadPeriodos();
        
        const mensaje = periodoData.id 
          ? '✅ Período actualizado correctamente' 
          : '✅ PERIODO ACADEMICO CREADO CORRECTAMENTE';
        this.mostrarToast(mensaje);
        
        setTimeout(() => {
          this.showPeriodoModal = false;
          this.selectedPeriodo = null;
          if (this.modalComponent) {
            this.modalComponent.resetSavingState();
          }
        }, 1000);
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarToast('❌ Error al guardar el período', 'error');
        if (this.modalComponent) {
          this.modalComponent.resetSavingState();
        }
      }
    });
  }

  togglePeriodoStatus(id: number) {
    const periodo = this.periodos.find(p => p.id === id);
    if (!periodo) return;
    
    const nuevoEstado = !periodo.activo;
    
    if (nuevoEstado) {
      const periodoActivoActual = this.periodos.find(p => p.activo === true && p.id !== id);
      
      if (periodoActivoActual) {
        this.periodoService.updatePeriodo(periodoActivoActual.id, {
          name: periodoActivoActual.nombre,
          startDate: periodoActivoActual.fechaInicio,
          endDate: periodoActivoActual.fechaFin,
          active: false,
          enrollmentDeadline: periodoActivoActual.fechaInicio
        }).subscribe({
          next: () => {
            periodoActivoActual.activo = false;
            
            this.periodoService.updatePeriodo(id, {
              name: periodo.nombre,
              startDate: periodo.fechaInicio,
              endDate: periodo.fechaFin,
              active: true,
              enrollmentDeadline: periodo.fechaInicio
            }).subscribe({
              next: () => {
                periodo.activo = true;
                this.mostrarToast('✅ PERIODO ACTIVADO');
              },
              error: (err) => {
                console.error('Error activando período:', err);
                this.mostrarToast('❌ Error al activar', 'error');
              }
            });
          },
          error: (err) => {
            console.error('Error desactivando período anterior:', err);
            this.mostrarToast('❌ Error al desactivar período anterior', 'error');
          }
        });
      } else {
        this.periodoService.updatePeriodo(id, {
          name: periodo.nombre,
          startDate: periodo.fechaInicio,
          endDate: periodo.fechaFin,
          active: true,
          enrollmentDeadline: periodo.fechaInicio
        }).subscribe({
          next: () => {
            periodo.activo = true;
            this.mostrarToast('✅ PERIODO ACTIVADO');
          },
          error: (err) => {
            console.error('Error activando período:', err);
            this.mostrarToast('❌ Error al activar', 'error');
          }
        });
      }
    } else {
      this.periodoService.updatePeriodo(id, {
        name: periodo.nombre,
        startDate: periodo.fechaInicio,
        endDate: periodo.fechaFin,
        active: false,
        enrollmentDeadline: periodo.fechaInicio
      }).subscribe({
        next: () => {
          periodo.activo = false;
          this.mostrarToast('✅ PERIODO DESACTIVADO');
        },
        error: (err) => {
          console.error('Error desactivando período:', err);
          this.mostrarToast('❌ Error al desactivar', 'error');
        }
      });
    }
  }

  deleteRole(id: number) {
    if(confirm('¿Estás seguro que quieres eliminar este rol?')) {
      this.roles = this.roles.filter(r => r.id !== id);
      this.mostrarToast('✅ Rol eliminado correctamente');
    }
  }
}