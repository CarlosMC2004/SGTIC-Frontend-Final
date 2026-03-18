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
  enrollmentDeadline?: string;
  plazoCambioTema?: number;
  minimoAvances?: number;
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
  isModalSaving = false;

  periodos: PeriodoAcademico[] = [];

  roles: CatalogRole[] = [
    { id: 1, nombre: 'administrador_sgtic', descripcion: 'Administrador del Sistema de Gestión de Trabajos de Titulación', fechaCreacion: '2024-01-15', sistema: true },
    { id: 2, nombre: 'coordinador_facultad', descripcion: 'Coordinador académico a nivel de facultad', fechaCreacion: '2024-01-15', sistema: true },
    { id: 3, nombre: 'coordinador_carrera', descripcion: 'Coordinador académico a nivel de carrera', fechaCreacion: '2024-01-15', sistema: true },
    { id: 4, nombre: 'docente', descripcion: 'Personal docente y tutores', fechaCreacion: '2024-01-15', sistema: true },
    { id: 5, nombre: 'estudiante', descripcion: 'Estudiantes en proceso de titulación', fechaCreacion: '2024-01-15', sistema: true }
  ];

  get periodosActivos(): number {
    return this.periodos.filter(p => p.activo).length;
  }

  get periodosInactivos(): number {
    return this.periodos.filter(p => !p.activo).length;
  }

  constructor(private periodoService: PeriodoService) {}

  ngOnInit() {
    setTimeout(() => {
      this.loadPeriodos();
    }, 500);
  }

  mostrarToast(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    setTimeout(() => {
      if (this.toast) {
        this.toast.mostrarToast(mensaje, tipo);
      }
    });
  }

  loadPeriodos() {
  this.periodoService.getPeriodos().subscribe({
    next: (data) => {
      this.periodos = [...data.map((p: any) => ({  // ✅ spread fuerza nueva referencia
        id: p.idPeriod,
        nombre: p.name,
        fechaInicio: p.startDate,
        fechaFin: p.endDate,
        enrollmentDeadline: p.enrollmentDeadline,
        plazoCambioTema: p.plazoCambioTema,
        minimoAvances: p.minimoAvances,
        activo: p.active
      }))];
    },
    error: (err) => {
      console.error('Error cargando períodos:', err);
      this.mostrarToast('Error al cargar los períodos', 'error');
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
        enrollmentDeadline: periodo.enrollmentDeadline,
        plazoCambioTema: periodo.plazoCambioTema,
        minimoAvances: periodo.minimoAvances,
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
    const periodoBackend = {
      name: periodoData.name,
      startDate: periodoData.startDate,
      endDate: periodoData.endDate,
      enrollmentDeadline: periodoData.enrollmentDeadline,
      plazoCambioTema: Number(periodoData.plazoCambioTema),
      minimoAvances: Number(periodoData.minimoAvances),
      active: periodoData.id ? periodoData.active : true
    };
 
    const request = periodoData.id
      ? this.periodoService.updatePeriodo(periodoData.id, periodoBackend)
      : this.periodoService.createPeriodo(periodoBackend);
 
    request.subscribe({
      next: (respuesta) => {
        const mensaje = periodoData.id
          ? 'Período actualizado correctamente'
          : 'Período creado correctamente';
 
        if (periodoData.id) {
          // ✅ ACTUALIZAR: reemplaza el item en el array local al instante
          const index = this.periodos.findIndex(p => p.id === periodoData.id);
          if (index !== -1) {
            this.periodos[index] = {
              id: periodoData.id,
              nombre: periodoData.name,
              fechaInicio: periodoData.startDate,
              fechaFin: periodoData.endDate,
              enrollmentDeadline: periodoData.enrollmentDeadline,
              plazoCambioTema: Number(periodoData.plazoCambioTema),
              minimoAvances: Number(periodoData.minimoAvances),
              activo: periodoData.active
            };
            this.periodos = [...this.periodos]; // nueva referencia para Angular
          }
        } else {
          // ✅ CREAR: agrega el nuevo período al array local al instante
          const nuevo: PeriodoAcademico = {
            id: respuesta.idPeriod || respuesta.id,
            nombre: periodoData.name,
            fechaInicio: periodoData.startDate,
            fechaFin: periodoData.endDate,
            enrollmentDeadline: periodoData.enrollmentDeadline,
            plazoCambioTema: Number(periodoData.plazoCambioTema),
            minimoAvances: Number(periodoData.minimoAvances),
            activo: true
          };
          this.periodos = [...this.periodos, nuevo];
        }
 
        // Cierra el modal y muestra toast
        if (this.modalComponent) {
          this.modalComponent.onSaveSuccess();
        }
        this.selectedPeriodo = null;
        this.mostrarToast(mensaje);
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarToast('Error al guardar el período', 'error');
        if (this.modalComponent) this.modalComponent.resetSavingState();
      }
    });
  }

  togglePeriodoStatus(id: number) {
    const periodo = this.periodos.find(p => p.id === id);
    if (!periodo || this.isModalSaving) return;

    const estadoActual = periodo.activo;
    const nuevoEstado = !estadoActual;
    this.isModalSaving = true;

    const otrosActivos = this.periodos.filter(p => p.id !== id && p.activo);

    periodo.activo = nuevoEstado;

    if (nuevoEstado) {
      otrosActivos.forEach(p => p.activo = false);
    }

    this.periodoService.updatePeriodo(id, {
      name: periodo.nombre,
      startDate: periodo.fechaInicio,
      endDate: periodo.fechaFin,
      enrollmentDeadline: periodo.enrollmentDeadline,
      plazoCambioTema: periodo.plazoCambioTema,
      minimoAvances: periodo.minimoAvances,
      active: nuevoEstado
    }).subscribe({
      next: () => {
        if (nuevoEstado) {
          otrosActivos.forEach(p => {
            this.periodoService.updatePeriodo(p.id, {
              name: p.nombre,
              startDate: p.fechaInicio,
              endDate: p.fechaFin,
              enrollmentDeadline: p.enrollmentDeadline,
              plazoCambioTema: p.plazoCambioTema,
              minimoAvances: p.minimoAvances,
              active: false
            }).subscribe();
          });
        }
        this.mostrarToast(nuevoEstado ? 'Período activado' : 'Período desactivado');
        this.isModalSaving = false;
      },
      error: () => {
        periodo.activo = estadoActual;
        if (nuevoEstado) {
          otrosActivos.forEach(p => p.activo = true);
        }
        this.mostrarToast('Error al actualizar el estado', 'error');
        this.isModalSaving = false;
      }
    });
  }

  deleteRole(id: number) {
    if (confirm('¿Estás seguro que quieres eliminar este rol?')) {
      this.roles = this.roles.filter(r => r.id !== id);
      this.mostrarToast('Rol eliminado correctamente');
    }
  }
}