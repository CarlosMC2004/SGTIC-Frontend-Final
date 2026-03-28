import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Detectamos si la petición va hacia el login
  const esPeticionDeLogin = req.url.includes('/auth/login');

  // 1. NO le pegamos el token si la petición es para hacer login
  if (token && !esPeticionDeLogin) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // 2. SOLO mostramos la alerta de expulsión si da error 401 y NO estamos intentando loguearnos
      if ((error.status === 401 || error.status === 403) && !esPeticionDeLogin) {
        console.warn('🚨 Sesión expirada o cerrada por el administrador.');

        localStorage.clear();
        alert('Tu sesión ha expirado o fue cerrada por un administrador.');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
