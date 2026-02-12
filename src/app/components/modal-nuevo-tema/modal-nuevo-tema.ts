import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-nuevo-tema',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-nuevo-tema.html',
  styleUrl: './modal-nuevo-tema.css'
})
export class ModalNuevoTema {

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
