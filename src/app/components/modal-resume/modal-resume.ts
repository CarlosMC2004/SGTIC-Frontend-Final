import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-resume-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-resume.html',
  styleUrls: ['./modal-resume.css']
})
export class ResumeModal {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  
  selectedFileName: string | null = null;
  selectedFile: File | null = null;

  resumeForm: FormGroup = this.fb.group({
    pais: ['ECUADOR', Validators.required],
    provincia: ['LOS RIOS', Validators.required],
    canton: ['QUEVEDO', Validators.required],
    parroquia: ['', Validators.required],
    direccionPrincipal: ['', Validators.required],
    direccionSecundaria: [''],
    telefonoCelular: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    telefonoFijo: ['']
  });

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Validar peso (Max 500KB) y formato
      if (file.size > 500 * 1024) {
        alert('La imagen excede el tamaño máximo de 500Kb.');
        return;
      }
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  cerrarModal() {
    this.close.emit();
  }

  guardar() {
    if (this.resumeForm.valid) {
      const formData = {
        datosPersonales: this.resumeForm.value,
        foto: this.selectedFile
      };
      this.save.emit(formData);
    } else {
      this.resumeForm.markAllAsTouched();
    }
  }
}