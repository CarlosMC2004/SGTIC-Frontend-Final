import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { SidebarComponent } from '../../../components/sidebar/sidebar'; // Asegúrate de que la ruta sea correcta
=======
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';
>>>>>>> 7073174a95fa2c9626a2ed1edddfa987ee1d8594

interface UserData {
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'Active' | 'Inactive';
  lastLogin: string;
<<<<<<< HEAD
  initial: string; // Para el avatar si no hay imagen
  color: string;   // Color del avatar
=======
  avatarColor: string;
>>>>>>> 7073174a95fa2c9626a2ed1edddfa987ee1d8594
}

interface MasterData {
  title: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, SidebarComponent],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class AdminDashboardComponent {
  
  // Datos simulados para la tabla
  recentUsers: UserData[] = [
=======
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class MenuPrincipalAdminComponent {

  recentUsers: User[] = [
>>>>>>> 7073174a95fa2c9626a2ed1edddfa987ee1d8594
    {
      name: 'Ana Martinez',
      email: 'ana.m@university.edu',
      role: 'STUDENT',
      status: 'Active',
      lastLogin: '2 hours ago',
      initial: 'A',
      color: '#ff8a65'
    },
    {
      name: 'Dr. Robert Chen',
      email: 'r.chen@university.edu',
      role: 'TEACHER',
      status: 'Active',
      lastLogin: '1 day ago',
      initial: 'D',
      color: '#ba68c8'
    },
    {
      name: 'Marco Polo',
      email: 'marco.p@university.edu',
      role: 'ADMIN',
      status: 'Inactive',
      lastLogin: '5 days ago',
      initial: 'M',
      color: '#90a4ae'
    }
  ];

<<<<<<< HEAD
  // Datos para las tarjetas inferiores
  masterConfigs: MasterData[] = [
    { title: 'Faculties', icon: 'domain', colorClass: 'bg-green' },
    { title: 'Careers', icon: 'school', colorClass: 'bg-teal' },
    { title: 'Periods', icon: 'calendar_today', colorClass: 'bg-olive' },
    { title: 'Modes', icon: 'category', colorClass: 'bg-emerald' }
  ];

  // Helper para asignar clases CSS según el rol
  getRoleClass(role: string): string {
    switch (role) {
      case 'STUDENT': return 'badge-student';
      case 'TEACHER': return 'badge-teacher';
      case 'ADMIN': return 'badge-admin';
      default: return '';
    }
  }
}
=======
  masterConfigs: MasterConfig[] = [
    {
      title: 'Faculties',
      description: 'Manage university departments and institutional structures.',
      icon: 'domain', // Antes: 'fa-solid fa-university'
      actionText: 'Manage Records'
    },
    {
      title: 'Careers',
      description: 'Define and configure degree programs and academic requirements.',
      icon: 'school', // Antes: 'fa-solid fa-graduation-cap'
      actionText: 'Manage Careers'
    },
    {
      title: 'Periods',
      description: 'Set up academic semesters, years, and active timeframes.',
      icon: 'calendar_month', // Antes: 'fa-regular fa-calendar-check'
      actionText: 'Config Periods'
    },
    {
      title: 'Modes',
      description: 'Define thesis titulation formats and graduation pathways.',
      icon: 'description', // Antes: 'fa-solid fa-book-open'
      actionText: 'Define Modes'
    }
  ];

  constructor() {}
}
>>>>>>> 7073174a95fa2c9626a2ed1edddfa987ee1d8594
