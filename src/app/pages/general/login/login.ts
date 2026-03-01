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

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Redirección basada en roles
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
