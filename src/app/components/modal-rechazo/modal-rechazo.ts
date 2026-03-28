import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-rechazo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-rechazo.html',
  styleUrl: './modal-rechazo.css',
})
export class ModalRechazo {
  @Input() titulo: string = 'Rechazar Solicitud';
  @Input() descripcion: string = 'Indique las razones específicas por las cuales esta solicitud no cumple con los requisitos. Este mensaje será enviado al estudiante.';
  @Input() labelMotivo: string = 'Motivo del rechazo';
  @Input() placeholderMotivo: string = 'Escriba aquí las razones por las cuales se rechaza la propuesta de tesis...';

  motivoRechazo: string = '';

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<string>();

  onClose() {
    this.cerrar.emit();
  }

  onConfirm() {
    if (this.motivoRechazo.trim().length > 5) {
      this.confirmar.emit(this.motivoRechazo);
    } else {
      alert('Por favor, escriba un motivo detallado antes de rechazar.');
    }
  }
}
