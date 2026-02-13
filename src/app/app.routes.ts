import { Routes } from '@angular/router';
import { LoginComponent } from './pages/general/login/login';
import {MenuPrincipalAdminComponent} from './pages/administrator/main-menu/main-menu';
import {AcademicConfiguration} from './pages/administrator/academic-configuration/academic-configuration';

export const routes: Routes = [
    //RUTA PARA EL LOGIN
    { path: 'login', component: LoginComponent },
    //RUTA MENU ADMINISTRADOR
    {path: 'main-menu', component: MenuPrincipalAdminComponent},
    //RUTA DE CONFIGURACION DE ADMINISTRADOR
    {path: 'academic-configuration', component: AcademicConfiguration}
];
