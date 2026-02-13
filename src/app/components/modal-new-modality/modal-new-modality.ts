import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-new-modality',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-new-modality.html',
  styleUrls: ['./modal-new-modality.css']
})
export class ModalNewModalityComponent {

  modalityName: string = '';
  modalityStatus: boolean = true;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{name: string, status: boolean}>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.modalityName.trim()) {
      this.save.emit({ name: this.modalityName, status: this.modalityStatus });
    }
  }
}
