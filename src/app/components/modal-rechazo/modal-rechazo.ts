import { Component, EventEmitter, Output } from '@angular/core';
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

  motivoRechazo: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    if (this.motivoRechazo.trim().length > 0) {
      this.confirm.emit(this.motivoRechazo);
    } else {
      alert('Por favor, escriba un motivo antes de rechazar.');
    }
  }
}
