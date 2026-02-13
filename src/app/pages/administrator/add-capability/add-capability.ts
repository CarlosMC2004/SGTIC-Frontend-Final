import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlassModalComponent } from '../../../components/glass-modal/glass-modal'; // Ajusta la ruta

@Component({
  selector: 'app-faculty-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GlassModalComponent],
  templateUrl: './add-capability.html',
  styleUrls: ['./add-capability.css']
})
export class FacultyAdminComponent {
  isModalVisible: boolean = true;
  facultyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.facultyForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  toggleModal() {
    this.isModalVisible = !this.isModalVisible;
    if (!this.isModalVisible) this.facultyForm.reset();
  }

  onSubmit() {
    if (this.facultyForm.valid) {
      console.log('New Faculty Data:', this.facultyForm.value);
      // Aquí iría tu servicio para guardar en PostgreSQL/Spring Boot
      this.toggleModal();
    }
  }
}