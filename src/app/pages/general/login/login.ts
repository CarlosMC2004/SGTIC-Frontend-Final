import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Importar Router

import { SolicitudIngresoModalComponent } from '../../../components/components-studients/modal-solicitar-acceso/modal-solicitar-acceso';
import { AuthLayoutComponent } from '../../../components/auth-layout/auth-layout'
import { RequestAccess, RequestAccessDTO } from '../../../services/request-access/request-access'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SolicitudIngresoModalComponent, AuthLayoutComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // Asumo que tienes tus estilos aquí
})

export class LoginComponent {
  //Inicio solicitar acceso --------------------------

  private requestAccessService = inject(RequestAccess);

  // 2. Variable para manejar el estado de carga
  estaCargando = false;

  procesarSolicitudAcceso(datosSolicitud: RequestAccessDTO) {
    this.estaCargando = true;

    this.requestAccessService.enviarSolicitud(datosSolicitud).subscribe({
      next: (respuesta) => {
        this.estaCargando = false;
        this.cerrarModal();
        alert('¡Éxito! ' + respuesta.message);
      },
      error: (errorRespuesta) => {
        this.estaCargando = false;
        const mensajeError = errorRespuesta.error?.error || 'Ocurrió un error inesperado al conectar con el servidor.';
        alert('Error: ' + mensajeError);
      }
    });
  }

  cerrarModal() {
    this.mostrarModalSolicitud = false;
  }




  //Final solicitar acceso---------------------------

  loginForm: FormGroup;
  showPassword = false;

  mostrarModalSolicitud = false;

  // Inyectamos el Router y el FormBuilder
  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@uteq\\.edu\\.ec$')]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  abrirModal(event: Event) {
    event.preventDefault(); // Evita que el enlace recargue la página
    this.mostrarModalSolicitud = true;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credenciales = this.loginForm.value;
      console.log('Intentando iniciar sesión con:', credenciales.username);

      // Simulamos que el backend nos responde que todo está OK
      const loginExitoso = true;

      if (loginExitoso) {
        // Redirigimos a la ruta del dashboard del estudiante que configuraste antes
        this.router.navigate(['/inicio-estudiante']);
      }

    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
