import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-edit-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-edit-teacher.html',
  styleUrl: './modal-edit-teacher.css',
})
export class ModalEditTeacher implements OnInit {

  @Input() teacherData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData: any = {
    idDocente: null,
    nombres: '',
    apellidos: '',
    correo: '',
    cedula: '',
    especialidades: '',
    isInvestigator: false
  };

  ngOnInit() {
    if (this.teacherData && this.teacherData.idDocente) {

      this.formData = {
        idDocente: this.teacherData.idDocente,
        nombres: this.teacherData.nombres || '',
        apellidos: this.teacherData.apellidos || '',
        correo: this.teacherData.correo || '',
        cedula: this.teacherData.cedula || '',
        especialidades: this.teacherData.especialidades ? this.teacherData.especialidades.join(', ') : '',
        isInvestigator: this.teacherData.isResearcher || false
      };
    }
  }

  closeModal() {
    this.close.emit();
  }

  guardarDatos() {
    this.save.emit(this.formData);
  }
}
