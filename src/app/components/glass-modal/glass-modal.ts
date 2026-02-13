import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-modal',
  standalone: true, // Si usas módulos, quita esto y agrégalo a tu Module
  imports: [CommonModule],
  templateUrl: './glass-modal.html',
  styleUrls: ['./glass-modal.css']
})
export class GlassModalComponent {
  @Input() isVisible: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();

  // Función para cerrar el modal al hacer clic en el fondo o la X
  close() {
    this.closeEvent.emit();
  }

  stopProp(event: Event) {
    event.stopPropagation();
  }
}