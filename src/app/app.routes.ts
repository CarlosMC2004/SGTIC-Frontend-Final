import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta pública - Login
  {
    path: 'login',
    loadComponent: () => import('./pages/general/login/login').then(m => m.LoginComponent)
  },
  // Rutas de Administrador
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/administrator/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/administrator/main-menu/main-menu').then(m => m.MainMenuComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/administrator/user-management/user-management').then(m => m.UserManagementComponent)
      },
      // NUEVO: Gestión de Roles
      {
        path: 'roles',
        loadComponent: () => import('./pages/administrator/role-management/role-management').then(m => m.RoleManagementComponent)
      },
      // NUEVO: Catálogos
      {
        path: 'catalogs',
        loadComponent: () => import('./pages/administrator/catalogs/catalogs').then(m => m.CatalogsComponent)
      },
      {
        path: 'structure',
        loadComponent: () => import('./pages/administrator/institutional-structure/institutional-structure').then(m => m.InstitutionalStructureComponent)
      },
      {
        path: 'configuration',
        loadComponent: () => import('./pages/administrator/academic-configuration/academic-configuration').then(m => m.AcademicConfiguration)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Rutas de Coordinador (ejemplo para futuro)
  /*{
    path: 'coordinator',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/coordinator/dashboard').then(m => m.DashboardComponent) }
    ]
  }, */
  // Redirecciones por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
