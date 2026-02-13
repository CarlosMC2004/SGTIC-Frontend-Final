import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/administrator/main-menu/main-menu';
import { InstitutionalStructureComponent } from './pages/administrator/institutional-structure/institutional-structure';

export const routes: Routes = [
    { path: 'main-menu', component: AdminDashboardComponent },
    { path: 'institutional-structure', component: InstitutionalStructureComponent },
];