import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { ChatComponent } from './components/chat/chat';


export const routes: Routes = [
  // Ruta pública - Login
  {
    path: 'login',
    loadComponent: () => import('./pages/general/login/login').then(m => m.LoginComponent)
  },


 // ✅ Ruta del chat - PÚBLICA (sin authGuard)
  {
  path: 'chat/:id',  // Cambiado para aceptar parámetro :id
   component: ChatComponent
  },

  {
  path: 'chat/coordinator',  // Ruta para el coordinador
  component: ChatComponent
},

  {
    path: 'hoja-de-vida',
    canActivate: [authGuard], // Opcional, pero recomendado para que no entren sin sesión
    loadComponent: () => import('./components/modal-resume/modal-resume').then(m => m.ResumeModal)
  },
  {
    path: 'change-password',
    canActivate: [authGuard], // Opcional, pero recomendado para que no entren sin sesión
    loadComponent: () => import('./components/modal-change-password/modal-change-password').then(m => m.ChangePasswordModal)
  },

  // Rutas de Administrador
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
      // 🔥 AQUÍ ESTÁ LA NUEVA RUTA DE AUDITORÍA 🔥
      {
        path: 'auditorias',
        loadComponent: () => import('./pages/administrator/auditoria-sesiones/auditoria-sesiones').then(m => m.AuditoriaSesionesComponent)
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
      // NUEVO: Gestión de Respaldos (Backup Dashboard)
      {
        path: 'backups',
        loadComponent: () => import('./pages/administrator/backup-dashboard/backup-dashboard').then(m => m.BackupDashboard)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Rutas de Coordinador (ejemplo para futuro)
  {
    path: 'coordinator',
    canActivate: [authGuard],
    children: [
      {
        path: 'Inicio',
        loadComponent: () => import('./pages/coordinator/inicio/inicio').then(m => m.Inicio)
      },
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
      },
      {
        path: 'DegreeOptions',
        loadComponent: () => import('./pages/coordinator/degree-options/degree-options').then(m => m.DegreeOptions)
      },
      {
        path: 'PendingProposalComponent',
        loadComponent: () => import('./pages/coordinator/pending-proposal/pending-proposal').then(m => m.PendingProposalComponent)
      },
      {
        path: 'Reports',
        loadComponent:() => import('./pages/coordinator/reports/reports').then(m => m.Reports)
      }
    ]
  },

  // Rutas de Estudiante
  {
    path: 'student',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/student/studient-dashboard/student-dashboard').then(m => m.StudentDashboardd)
      },
      {
        path: 'process-setup',
        loadComponent: () => import('./pages/student/process-setup/process-setup').then(m => m.ProcessSetup)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/student/student-reports/student-reports').then(m => m.StudentReports)
      }
    ]
  },
  {
    path: 'director',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/director/director-dashboard/director-dashboard').then(m => m.DirectorDashboardComponent)
      },
      {
        path: 'tutorships',
        loadComponent: () => import('./pages/director/tutorships/tutorships').then(m => m.TutorshipsComponent)
      },
      {
        path: 'advances',
        loadComponent: () => import('./pages/director/advances/advances').then(m => m.AdvancesComponent)
      },
      {
        path: 'certifications',
        loadComponent: () => import('./pages/director/certifications/certifications').then(m => m.CertificationsComponent)
      }
    ]
  },



  // Redirecciones por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }



];
