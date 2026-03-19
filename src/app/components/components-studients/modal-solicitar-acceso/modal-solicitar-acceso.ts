import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Selection, SelectionItemDTO } from '../../../services/selection/selection';
import { RequestAccessDTO } from '../../../services/request-access/request-access';

@Component({
  selector: 'app-modal-solicitar-acceso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-solicitar-acceso.html',
  styleUrls: ['./modal-solicitar-acceso.css'],
})
export class SolicitudIngresoModalComponent implements OnInit {
  
  @Output() onCerrar = new EventEmitter<void>();
  @Output() onEnviarDatos = new EventEmitter<RequestAccessDTO>();

  private fb = inject(FormBuilder);
  private selectionService = inject(Selection);

  facultades: SelectionItemDTO[] = [];
  carrerasDisponibles: SelectionItemDTO[] = [];

  solicitudForm: FormGroup = this.fb.group({
    identificacion: ['', [Validators.required, Validators.pattern('^[0-9-]*$')]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@uteq\\.edu\\.ec$')]],
    id_facultad: ['', Validators.required],
    id_carrera: [{ value: '', disabled: true }, Validators.required]
  });

  ngOnInit(): void {
    this.selectionService.getFaculties().subscribe({
      next: (data) => this.facultades = data,
      error: (err) => console.error('Error al cargar facultades:', err)
    });

    this.solicitudForm.get('id_facultad')?.valueChanges.subscribe(facultadId => {
      const idCarreraControl = this.solicitudForm.get('id_carrera');
      idCarreraControl?.setValue('');

      if (facultadId) {
        this.selectionService.getCareersByFaculty(facultadId).subscribe({
          next: (data) => {
            this.carrerasDisponibles = data;
            idCarreraControl?.enable();
          },
          error: (err) => console.error('Error al cargar carreras:', err)
        });
      } else {
        this.carrerasDisponibles = [];
        idCarreraControl?.disable();
      }
    });
  }

  cerrarModal() {
    this.onCerrar.emit();
  }

  enviarSolicitud() {
    if (this.solicitudForm.valid) {
      const formValue = this.solicitudForm.value;
      
      const datosParaBD: RequestAccessDTO = {
        identificacion: formValue.identificacion,
        correo: formValue.correo,
        nombres: formValue.nombres,
        apellidos: formValue.apellidos,
        idFacultad: Number(formValue.id_facultad),
        idCarrera: Number(formValue.id_carrera),
        idPeriodo: 78 // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN! (Reemplazar por variable dinámica si ya tienes el servicio)
      };

      this.onEnviarDatos.emit(datosParaBD);
    } else {
      this.solicitudForm.markAllAsTouched();
    }
  }
}