import { Routes } from '@angular/router';
import { LoginComponent } from './pages/general/login/login';

export const routes: Routes = [
    //RUTA PARA EL LOGIN
    { path: 'login', component: LoginComponent },
import { MenuPrincipalAdminComponent } from './pages/administrator/main-menu/main-menu';

export const routes: Routes = [
    { path: 'main-menu', component: MenuPrincipalAdminComponent },
];
