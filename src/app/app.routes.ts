import { Routes } from '@angular/router';
<<<<<<< HEAD
=======
import { InstitutionalStructureComponent } from './pages/administrator/institutional-structure/institutional-structure';
>>>>>>> 3b8c420c2e7e916c77ce1b9f5a8d40eee3c249d8
import { LoginComponent } from './pages/general/login/login';
import { MenuPrincipalAdminComponent } from './pages/administrator/main-menu/main-menu';
import {AcademicConfiguration} from './pages/administrator/academic-configuration/academic-configuration';
import { InstitutionalStructureComponent } from './pages/administrator/institutional-structure/institutional-structure';
import { FacultyAdminComponent } from './pages/administrator/add-capability/add-capability';
import { CareerAdminComponent } from './pages/administrator/add-career/add-career';

export const routes: Routes = [
    //RUTA PARA EL LOGIN
    { path: 'login', component: LoginComponent },
    //RUTA MENU ADMINISTRADOR
    { path: 'main-menu', component: MenuPrincipalAdminComponent },
    //RUTA DE CONFIGURACION DE ADMINISTRADOR
<<<<<<< HEAD
    { path: 'AcademicConfiguration', component: AcademicConfiguration },
    //RUTA DE ESTRUCTURA INSTITUCIONAL
    { path: 'institutional-structure', component: InstitutionalStructureComponent},
    //RUTA PARA AGREGAR NUEVA FACULTAD
    { path: 'add-capability', component: FacultyAdminComponent},
    //RUTA PARA AGREGAR NUEVA CARRERA
    { path: 'add-career', component: CareerAdminComponent},
=======
    {path: 'academic-configuration', component: AcademicConfiguration},
    { path: 'institutional-structure', component: InstitutionalStructureComponent },
>>>>>>> 3b8c420c2e7e916c77ce1b9f5a8d40eee3c249d8
];
