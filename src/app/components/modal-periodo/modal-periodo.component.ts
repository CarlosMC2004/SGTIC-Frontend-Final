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
    active: true
  };
  
  isSaving = false;

  ngOnInit() {
    if (this.periodo) {
      this.formData = { ...this.periodo };
    }
  }

  isValid(): boolean {
    return this.formData.name && this.formData.startDate && this.formData.endDate;
  }

  closeModal(): void {
    if (!this.isSaving) {
      this.close.emit();
    }
  }

  savePeriodo(): void {
    if (!this.isValid() || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.saving.emit(true);

    const periodoCompleto = {
      name: this.formData.name,
      startDate: this.formData.startDate,
      endDate: this.formData.endDate,
      active: this.formData.active,
      enrollmentDeadline: this.formData.startDate
    };
    
    console.log('Guardando período:', periodoCompleto);
    this.save.emit(periodoCompleto);
  }

  resetSavingState(): void {
    this.isSaving = false;
    this.saving.emit(false);
  }

  // Método para mostrar mensajes desde el padre
  mostrarToast(mensaje: string, tipo: 'exito' | 'error' = 'exito'): void {
    setTimeout(() => {
      if (this.toast) {
        this.toast.mostrarToast(mensaje, tipo);
      }
    });
  }
}