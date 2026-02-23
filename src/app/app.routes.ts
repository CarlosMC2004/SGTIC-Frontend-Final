import { Routes } from '@angular/router';
import { LoginComponent } from './pages/general/login/login';
import { MenuPrincipalAdminComponent } from './pages/administrator/main-menu/main-menu';
import {AcademicConfiguration} from './pages/administrator/academic-configuration/academic-configuration';
import { InstitutionalStructureComponent } from './pages/administrator/institutional-structure/institutional-structure';
import { UserManagementComponent } from './pages/administrator/user-management/user-management';
import {StudentRequests} from './pages/coordinator/student-requests/student-requests';
import {BankThemes} from './pages/coordinator/bank-themes/bank-themes';
import {Assignments} from './pages/coordinator/assignments/assignments';

export const routes: Routes = [
    //RUTA PARA EL LOGIN
    { path: 'login', component: LoginComponent },
    //RUTA MENU ADMINISTRADOR
    { path: 'main-menu', component: MenuPrincipalAdminComponent },
    //RUTA DE ESTRUCTURA INSTITUCIONAL
    { path: 'institutional-structure', component: InstitutionalStructureComponent},
    //RUTA DE CONFIGURACION DE ADMINISTRADOR
    { path: 'academic-configuration', component: AcademicConfiguration},
    //RUTA DE GESTION DE USUARIOS
    { path: 'user-management', component: UserManagementComponent},
    //RUTA GESTION DE SOLICITUDES DE ESTUDIANTES (COORDINADOR)
    {path: 'student-requests', component: StudentRequests},
    //RUTA GESTION DE TEMAS (COORDINADOR)
    {path: 'bankt-themes', component: BankThemes},
    //RUTA GESTION DE ASIGANCIONES (COORDINADOR)
    {path: 'Assignments', component: Assignments},
];
