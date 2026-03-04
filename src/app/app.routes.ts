import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta pública - Login
  {
    path: 'login',
    loadComponent: () => import('./pages/general/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'hoja-de-vida',
    canActivate: [authGuard], // Opcional, pero recomendado para que no entren sin sesión
    loadComponent: () => import('./components/modal-resume/modal-resume').then(m => m.ResumeModal)
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
  {
    path: 'coordinator',
    canActivate: [authGuard],
    children: [
      //{ path: 'dashboard', loadComponent: () => import('./pages/coordinator/dashboard').then(m => m.DashboardComponent) }
      {
        path: 'StudentRequests',
        loadComponent: () => import('./pages/coordinator/student-requests/student-requests').then(m => m.StudentRequests)
      },
      {
        path: 'BankThemes',
        loadComponent: () => import('./pages/coordinator/bank-themes/bank-themes').then(m => m.BankThemes)
      },
      {
        path: 'Assignments',
        loadComponent: () =>import('./pages/coordinator/assignments/assignments').then(m => m.Assignments)
      },
      {
        path: 'Teachers',
        loadComponent: () => import('./pages/coordinator/teachers/teachers').then(m => m.Teachers)
      }
    ]
  },

  {
    path: 'student',
    canActivate: [authGuard],
    children: [
      {path: 'dashboard',
      loadComponent: () => import('./pages/student/studient-dashboard/student-dashboard').then(m => m.StudentDashboard)},
      {
        path: 'process-setup',
        loadComponent: () => import('./pages/student/process-setup/process-setup').then(m => m.ProcessSetup)}
    ]
  },


  // Redirecciones por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
