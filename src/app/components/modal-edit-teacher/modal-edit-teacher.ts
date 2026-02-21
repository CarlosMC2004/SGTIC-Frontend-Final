import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-edit-teacher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-edit-teacher.html',
  styleUrl: './modal-edit-teacher.css',
})
export class ModalEditTeacher {

  @Input() teacherData: any = null;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
