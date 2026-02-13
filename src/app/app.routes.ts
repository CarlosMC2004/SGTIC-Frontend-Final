import { Routes } from '@angular/router';
<<<<<<< HEAD
import { AdminDashboardComponent } from './pages/administrator/main-menu/main-menu';
import { InstitutionalStructureComponent } from './pages/administrator/institutional-structure/institutional-structure';

export const routes: Routes = [
    { path: 'main-menu', component: AdminDashboardComponent },
    { path: 'institutional-structure', component: InstitutionalStructureComponent },
];
=======
import { LoginComponent } from './pages/general/login/login';
import {MenuPrincipalAdminComponent} from './pages/administrator/main-menu/main-menu';
import {AcademicConfiguration} from './pages/administrator/academic-configuration/academic-configuration';

export const routes: Routes = [
    //RUTA PARA EL LOGIN
    { path: 'login', component: LoginComponent },
    //RUTA MENU ADMINISTRADOR
    {path: 'main-menu', component: MenuPrincipalAdminComponent},
    //RUTA DE CONFIGURACION DE ADMINISTRADOR
    {path: 'AcademicConfiguration', component: AcademicConfiguration}
];
>>>>>>> 7073174a95fa2c9626a2ed1edddfa987ee1d8594
