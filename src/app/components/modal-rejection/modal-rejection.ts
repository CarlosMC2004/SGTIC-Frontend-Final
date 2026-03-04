import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-modal-rejection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-rejection.html',
  styleUrl: './modal-rejection.css',
})
export class ModalRejection {
  @Output() close = new EventEmitter<void>();
  onClose() {
    this.close.emit();
  }
}
