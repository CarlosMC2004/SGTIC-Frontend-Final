import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-modal-new-topic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-new-topic.html',
  styleUrl: './modal-new-topic.css',
})
export class ModalNewTopic {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
