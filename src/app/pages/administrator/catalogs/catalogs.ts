import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
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
      active: periodoData.id ? periodoData.active : true,  // ✅ 'active' no 'activo'
      enrollmentDeadline: periodoData.startDate
    };

    const request = periodoData.id
      ? this.periodoService.updatePeriodo(periodoData.id, periodoBackend)
      : this.periodoService.createPeriodo(periodoBackend);

    request.subscribe({
      next: () => {
        this.loadPeriodos();
        const mensaje = periodoData.id ? 'Período actualizado correctamente' : 'Período creado correctamente';
        this.mostrarToast(mensaje);
        if (this.modalComponent) this.modalComponent.resetSavingState();
        this.showPeriodoModal = false;
        this.selectedPeriodo = null;
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

  // ✅ Guardar otros activos ANTES de cambiar estados
  const otrosActivos = this.periodos.filter(p => p.id !== id && p.activo);

  // Actualizar visualmente de inmediato
  periodo.activo = nuevoEstado;

  // ✅ Desactivar otros visualmente también
  if (nuevoEstado) {
    otrosActivos.forEach(p => p.activo = false);
  }

  this.periodoService.updatePeriodo(id, {
    name: periodo.nombre,
    startDate: periodo.fechaInicio,
    endDate: periodo.fechaFin,
    active: nuevoEstado,
    enrollmentDeadline: periodo.fechaInicio
  }).subscribe({
    next: () => {
      if (nuevoEstado) {
        otrosActivos.forEach(p => {
          this.periodoService.updatePeriodo(p.id, {
            name: p.nombre,
            startDate: p.fechaInicio,
            endDate: p.fechaFin,
            active: false,
            enrollmentDeadline: p.fechaInicio
          }).subscribe();
        });
      }
      this.mostrarToast(nuevoEstado ? 'Período activado' : 'Período desactivado');
      this.isModalSaving = false;
    },
    error: () => {
      // Revertir todo si falla
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