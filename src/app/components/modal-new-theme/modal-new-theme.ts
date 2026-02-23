import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-modal-new-theme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-new-theme.html',
  styleUrl: './modal-new-theme.css',
})

export class ModalNewTheme {

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
