import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlassModalComponent } from '../../../components/glass-modal/glass-modal';

@Component({
  selector: 'app-career-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GlassModalComponent],
  templateUrl: './add-career.html',
  styleUrls: ['./add-career.css']
})
export class CareerAdminComponent implements OnInit {
  isModalVisible: boolean = true; // Recuerda cambiar a true si quieres probarlo directo
  careerForm: FormGroup;
  
  // Lista simulada de facultades (esto vendría de tu base de datos)
  facultyList = [
    { id: 1, name: 'Faculty of Engineering' },
    { id: 2, name: 'Faculty of Health Sciences' },
    { id: 3, name: 'Faculty of Arts & Humanities' },
    { id: 4, name: 'Faculty of Business' }
  ];

  constructor(private fb: FormBuilder) {
    this.careerForm = this.fb.group({
      name: ['', Validators.required],
      // Aquí el valor se enlaza al ID de la facultad
      facultyId: ['', Validators.required], 
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Aquí llamarías a tu servicio: this.facultyService.getAll().subscribe(...)
  }

  toggleModal() {
    this.isModalVisible = !this.isModalVisible;
    if (!this.isModalVisible) {
      this.careerForm.reset();
      // Reseteamos el select al valor por defecto
      this.careerForm.controls['facultyId'].setValue('');
    }
  }

  onSubmit() {
    if (this.careerForm.valid) {
      // Este objeto tendrá: { name: '...', facultyId: '1', description: '...' }
      const newCareer = this.careerForm.value;
      
      console.log('Sending to Backend:', newCareer);
      
      // Aquí iría la llamada al backend para guardar
      // this.careerService.create(newCareer).subscribe(...)

      this.toggleModal();
    }
  }
}