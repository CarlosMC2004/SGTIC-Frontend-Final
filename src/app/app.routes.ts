import { Routes } from '@angular/router';
import { LoginComponent } from './pages/general/login/login';
import { MenuPrincipalAdminComponent } from './pages/administrator/main-menu/main-menu';
import {AcademicConfiguration} from './pages/administrator/academic-configuration/academic-configuration';
import { InstitutionalStructureComponent } from './pages/administrator/institutional-structure/institutional-structure';
import { UserManagementComponent } from './pages/administrator/user-management/user-management';

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
];
