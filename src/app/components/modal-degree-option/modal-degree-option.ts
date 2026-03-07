import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DegreeOptionService } from '../../services/degree-option/degree-option.service';
import { DegreeOption } from '../../models/degree-option.model';

@Component({
  selector: 'app-modal-degree-option',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-degree-option.html',
  styleUrl: './modal-degree-option.css'
})
export class ModalDegreeOption {
  @Output() onClose = new EventEmitter<boolean>();

  option: DegreeOption = {
    name: '',
    description: '',
    active: true,
    iconName: 'menu_book'
  };

  constructor(private degreeService: DegreeOptionService) {}

  guardar() {
    this.degreeService.save(this.option).subscribe({
      next: () => {
        this.onClose.emit(true); // Cierra y refresca la lista
      },
      error: (err) => console.error('Error al guardar:', err)
    });
  }

  cerrar() {
    this.onClose.emit(false);
  }
}
