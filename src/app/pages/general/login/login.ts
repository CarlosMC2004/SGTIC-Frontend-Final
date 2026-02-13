import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// Asegúrate de que la ruta de importación sea correcta según tu estructura
import { AuthLayoutComponent } from '../../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false; // Para el ojito de ver contraseña

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]], // Validación básica
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Datos enviados:', this.loginForm.value);
      // Aquí llamarás a tu AuthService más adelante
    } else {
      this.loginForm.markAllAsTouched(); // Marca los errores si el usuario intenta enviar vacío
    }
  }
}