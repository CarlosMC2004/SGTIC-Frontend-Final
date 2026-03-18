import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AuthLayoutComponent } from '../../../components/auth-layout/auth-layout';
import { SolicitudIngresoModalComponent } from '../../../components/components-studients/modal-solicitar-acceso/modal-solicitar-acceso'
import { RequestAccess } from '../../../services/request-access/request-access';
import { RequestAccessDTO } from '../../../services/request-access/request-access';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayoutComponent, SolicitudIngresoModalComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  isModalOpen = false;
  private requestAccess = inject(RequestAccess);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
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

        if (response.primerIngreso === false) {
          this.router.navigate(['/change-password']).catch(err => {
            console.error('Error de enrutamiento: ¿Ya registraste /hoja-de-vida en tus rutas?', err);
            this.errorMessage = 'Error interno: La ruta de destino no existe.';
          });
          return;
        }

        const roles = response.roles;

        if (roles.includes('administrador_sgtic')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('coordinador_facultad')) {
          this.router.navigate(['/coordinator/faculty']);
        } else if (roles.includes('coordinador_carrera')) {
          this.router.navigate(['/coordinator/StudentRequests']);
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
  openModal(event: Event) {
    event.preventDefault();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  handleRequestAccessSubmission(data: RequestAccessDTO) {
    this.requestAccess.enviarSolicitud(data).subscribe({
      next: (response) => {
        alert('Solicitud enviada exitosamente. Nos pondremos en contacto contigo pronto.');
        this.closeModal();
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Un error ocurrió al enviar la solicitud. Intente nuevamente.';
        alert(errorMsg);
      }
    });
  }
}
