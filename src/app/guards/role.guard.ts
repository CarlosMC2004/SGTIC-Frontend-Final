import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('administrador_sgtic')) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

export const coordinatorFacultyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.hasAnyRole(['administrador_sgtic', 'coordinador_facultad']);
};

export const coordinatorCareerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.hasAnyRole(['administrador_sgtic', 'coordinador_facultad', 'coordinador_carrera']);
};
