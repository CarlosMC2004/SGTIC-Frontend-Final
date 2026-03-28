import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Detectamos si la petición es de login para evitar bucles infinitos
  const esPeticionDeLogin = req.url.includes('/auth/login');

  // 1. SEGURIDAD: Solo pegamos el Token si existe y NO es un intento de login
  if (token && !esPeticionDeLogin) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // 2. LÓGICA DE EXPULSIÓN (SESIONES ACTIVAS):
      // Si el servidor responde 401 (No autorizado) o 403 (Prohibido)
      // y no es la pantalla de login, significa que el token ya no vale o el Admin nos sacó.
      if ((error.status === 401 || error.status === 403) && !esPeticionDeLogin) {
        console.warn('🚨 Acceso denegado: Sesión expirada o cerrada por el administrador.');

        // Limpiamos todo rastro de la sesión vieja
        authService.logout(); // O localStorage.clear();

        // Alerta amigable para el usuario
        alert('Tu sesión ha expirado o fue cerrada por un administrador.');

        // Redirigimos al inicio
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
