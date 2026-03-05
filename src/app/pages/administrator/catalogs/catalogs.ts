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
  isModalSaving = false;

  periodos: PeriodoAcademico[] = [];
  
  roles: CatalogRole[] = [ /* ... */ ];
  
  // 👇 AGREGAR ESTAS PROPIEDADES COMPUTADAS AQUÍ
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

  
// NUEVO MÉTODO PARA MOSTRAR TOAST DE FORMA SEGURA
mostrarToast(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
  setTimeout(() => {
    if (this.toast) {
      this.toast.mostrarToast(mensaje, tipo);  // AHORA LLAMA A mostrarToast
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
      
      // 👇 MOSTRAR MENSAJE ANTES DE CERRAR EL MODAL
      const mensaje = periodoData.id 
        ? 'Período actualizado correctamente' 
        : 'PERIODO ACADEMICO CREADO CORRECTAMENTE';
      this.mostrarToast(mensaje);
      
      // 👇 AUMENTAR TIEMPO PARA CERRAR EL MODAL
      setTimeout(() => {
        if (this.modalComponent) {
          this.modalComponent.resetSavingState();
        }
        this.showPeriodoModal = false;
        this.selectedPeriodo = null;
      }, 1000); // 👈 AUMENTADO DE 300ms a 500ms
    },
    error: (err) => {
      console.error('Error:', err);
      this.mostrarToast(' Error al guardar el período', 'error');
      
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
        next: () => {
          this.mostrarToast(
            periodo.activo ?  ' PERIODO DESACTIVADO' : ' PERIODO ACTIVADO' 
          );
        },
        error: (err) => {
          console.error('Error actualizando estado:', err);
          periodo.activo = estadoAnterior;
          this.mostrarToast(' Error al actualizar el estado', 'error');
        }
      });
    }
  }

  deleteRole(id: number) {
    if(confirm('¿Estás seguro que quieres eliminar este rol?')) {
      this.roles = this.roles.filter(r => r.id !== id);
      this.mostrarToast(' Rol eliminado correctamente');
    }
  }
}