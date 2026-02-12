import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-editar-docente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-editar-docente.html',
  styleUrls: ['./modal-editar-docente.css']
})
export class ModalEditarDocenteComponent {

  @Input() teacherData: any = null;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
