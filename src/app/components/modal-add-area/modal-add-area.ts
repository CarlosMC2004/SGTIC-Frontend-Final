import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-add-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-add-area.html',
  styleUrls: ['./modal-add-area.css']
})
export class ModalAddAreaComponent {

  areaName: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.areaName.trim()) {
      this.save.emit(this.areaName.trim());
    }
  }
}
