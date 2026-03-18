import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastMensajeComponent } from '../Toast/toast-mensaje.component';

@Component({
  selector: 'app-modal-periodo',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastMensajeComponent],
  templateUrl: './modal-periodo.html',
  styleUrls: ['./modal-periodo.css']
})
export class ModalPeriodoComponent implements OnInit {
  @ViewChild('toast') toast!: ToastMensajeComponent;

  @Input() periodo: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() saving = new EventEmitter<boolean>();

  formData: any = {
    name: '',
    startDate: '',
    endDate: '',
    enrollmentDeadline: '',
    plazoCambioTema: 30,
    minimoAvances: 3,
    active: true
  };

  isSaving = false;

  ngOnInit() {
    if (this.periodo) {
      this.formData = {
        id: this.periodo.id,
        name: this.periodo.name || this.periodo.nombre,
        startDate: this.periodo.startDate,
        endDate: this.periodo.endDate,
        enrollmentDeadline: this.periodo.enrollmentDeadline || this.periodo.startDate,
        plazoCambioTema: this.periodo.plazoCambioTema || 30,
        minimoAvances: this.periodo.minimoAvances || 3,
        active: this.periodo.active !== undefined ? this.periodo.active : true
      };
    }
  }

  isValid(): boolean {
    return this.formData.name &&
           this.formData.startDate &&
           this.formData.endDate &&
           this.formData.enrollmentDeadline &&
           this.formData.plazoCambioTema !== null &&
           this.formData.plazoCambioTema !== undefined &&
           this.formData.minimoAvances !== null &&
           this.formData.minimoAvances !== undefined;
  }

  closeModal(): void {
    if (!this.isSaving) {
      this.close.emit();
    }
  }

  savePeriodo(): void {
    if (!this.isValid() || this.isSaving) return;

    if (this.formData.startDate > this.formData.endDate) {
      this.mostrarToast('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return;
    }

    if (this.formData.enrollmentDeadline < this.formData.startDate ||
        this.formData.enrollmentDeadline > this.formData.endDate) {
      this.mostrarToast('La fecha límite de matriculación debe estar entre fecha inicio y fecha fin', 'error');
      return;
    }

    if (this.formData.plazoCambioTema < 0) {
      this.mostrarToast('El plazo para cambio de tema debe ser positivo', 'error');
      return;
    }

    if (this.formData.minimoAvances < 1) {
      this.mostrarToast('El mínimo de avances debe ser al menos 1', 'error');
      return;
    }

    this.isSaving = true;
    this.saving.emit(true);

    const periodoCompleto: any = {
      name: this.formData.name,
      startDate: this.formData.startDate,
      endDate: this.formData.endDate,
      enrollmentDeadline: this.formData.enrollmentDeadline,
      plazoCambioTema: Number(this.formData.plazoCambioTema),
      minimoAvances: Number(this.formData.minimoAvances),
      active: this.formData.active
    };

    if (this.formData.id) {
      periodoCompleto.id = this.formData.id;
    }

    this.save.emit(periodoCompleto);
  }

  // ✅ Llamado por el padre cuando la API responde OK → cierra el modal
  onSaveSuccess(): void {
    this.isSaving = false;
    this.saving.emit(false);
    this.close.emit(); // <-- AQUÍ está el fix: cierra el modal desde adentro
  }

  // Llamado por el padre cuando la API responde con error → resetea sin cerrar
  resetSavingState(): void {
    this.isSaving = false;
    this.saving.emit(false);
  }

  mostrarToast(mensaje: string, tipo: 'exito' | 'error' = 'exito'): void {
    setTimeout(() => {
      if (this.toast) {
        this.toast.mostrarToast(mensaje, tipo);
      }
    });
  }
}