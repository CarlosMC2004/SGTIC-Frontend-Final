import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
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
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // CAMBIO: 'username' -> 'email' para coincidir con el backend
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';

    // 1. Validación del formulario
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // 2. Activamos el estado de carga
    this.isLoading = true;

    // 3. Petición al backend
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;

        // ---> VALIDACIÓN DE PRIMER INGRESO <---
        if (response.primerIngreso === false) {
          this.router.navigate(['/hoja-de-vida']).catch(err => {
            console.error('Error de enrutamiento: ¿Ya registraste /hoja-de-vida en tus rutas?', err);
            this.errorMessage = 'Error interno: La ruta de destino no existe.';
          });
          return; // Detiene la ejecución aquí
        }

        // ---> REDIRECCIÓN BASADA EN ROLES <---
        const roles = response.roles;

        if (roles.includes('administrador_sgtic')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('coordinador_facultad')) {
          this.router.navigate(['/coordinator/faculty']);
        } else if (roles.includes('coordinador_carrera')) {
          this.router.navigate(['/coordinator/career']);
        } else if (roles.includes('docente') || roles.includes('director_trabajo_titulacion')) {
          this.router.navigate(['/teacher/dashboard']);
        } else if (roles.includes('estudiante')) {
          this.router.navigate(['/student/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        // 4. Manejo de errores
        this.isLoading = false;
        
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Credenciales incorrectas o usuario inactivo';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
        }
      }
    });
  }
}
