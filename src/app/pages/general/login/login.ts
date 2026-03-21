import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AuthLayoutComponent } from '../../../components/auth-layout/auth-layout';
import { SolicitudIngresoModalComponent } from '../../../components/components-studients/modal-solicitar-acceso/modal-solicitar-acceso';
import { RequestAccess, RequestAccessDTO } from '../../../services/request-access/request-access';

// --- NUEVA IMPORTACIÓN PARA LA AUTO-MATRÍCULA ---
import { ManageRegistrationService } from '../../../services/ManageRegistrationService/manage-registration-service';

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
  // --- INYECCIÓN DEL NUEVO SERVICIO ---
  private registrationService = inject(ManageRegistrationService);

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
      next: (response: any) => {
        // --- GUARDAR DATOS EN LOCALSTORAGE ---
        if (response.email) {
          localStorage.setItem('user_email', response.email);
        }

        if (response.context && response.context.idStudent) {
          localStorage.setItem('student_id', response.context.idStudent.toString());
        }
        // ------------------------------------

        if (response.primerIngreso === false) {
          this.isLoading = false; // Detenemos el loader
          this.router.navigate(['/change-password']).catch(err => {
            console.error('Error de enrutamiento: ¿Ya registraste /change-password en tus rutas?', err);
            this.errorMessage = 'Error interno: La ruta de destino no existe.';
          });
          return;
        }

        const roles = response.roles || [];

        // Redirecciones basadas en el rol
        if (roles.includes('administrador_sgtic')) {
          this.isLoading = false;
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('coordinador_facultad')) {
          this.isLoading = false;
          this.router.navigate(['/coordinator/faculty']);
        } else if (roles.includes('coordinador_carrera')) {
          this.isLoading = false;
          this.router.navigate(['/coordinator/Inicio']);
        } else if (roles.includes('docente') || roles.includes('director_trabajo_titulacion')) {
          this.isLoading = false;
          this.router.navigate(['/director/dashboard']);
        
        // ==============================================================
        // LÓGICA DE ESTUDIANTE: AUTO-MATRÍCULA ANTES DE IR AL DASHBOARD
        // ==============================================================
        } else if (roles.includes('estudiante')) {
          const studentId = response.context?.idStudent;
          
          if (studentId) {
            // No detenemos el 'isLoading' porque seguimos procesando
            this.registrationService.autoEnroll(studentId).subscribe({
              next: (enrollRes) => {
                console.log('Auto-matrícula completada:', enrollRes.mensaje);
                this.isLoading = false;
                this.router.navigate(['/student/dashboard']);
              },
              error: (err) => {
                console.error('Error en proceso de matrícula:', err);
                this.isLoading = false;
                
                // Extraemos el mensaje de la base de datos (ej. "No hay periodo activo")
                const errorMsg = err.error?.message || err.error?.error || 'No se pudo verificar su matrícula actual.';
                
                // Mostramos el mensaje, pero le permitimos ir al dashboard de todas formas
                alert(errorMsg); 
                this.router.navigate(['/student/dashboard']);
              }
            });
          } else {
            console.warn('SGTIC: El backend no envió el idStudent en el context.');
            this.isLoading = false;
            this.router.navigate(['/student/dashboard']);
          }
        // ==============================================================

        } else {
          this.isLoading = false;
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

  // Métodos del modal de Solicitud de Ingreso
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
        alert(response.message || 'Solicitud enviada exitosamente.');
        this.closeModal();
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.error?.error || 'Un error ocurrió al enviar la solicitud. Intente nuevamente.';
        alert(errorMsg);
      }
    });
  }
}