import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-rechazo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-rechazo.html',
  styleUrl: './modal-rechazo.css',
})
export class ModalRechazo {

  @Output() close = new EventEmitter<void>();
  onClose() {
    this.close.emit();
  }
}

