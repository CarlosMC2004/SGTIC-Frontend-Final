import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatarColor: string; // Para simular el avatar
}

interface MasterConfig {
  title: string;
  description: string;
  icon: string;
  actionText: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class MenuPrincipalAdminComponent {
  
  // Datos simulados para la tabla de usuarios
  recentUsers: User[] = [
    {
      name: 'Ana Martinez',
      email: 'ana.m@university.edu',
      role: 'STUDENT',
      status: 'Active',
      lastLogin: '2 hours ago',
      avatarColor: '#FF8A65'
    },
    {
      name: 'Dr. Robert Chen',
      email: 'r.chen@university.edu',
      role: 'TEACHER',
      status: 'Active',
      lastLogin: '1 day ago',
      avatarColor: '#BA68C8'
    },
    {
      name: 'Marco Polo',
      email: 'marco.p@university.edu',
      role: 'ADMIN',
      status: 'Inactive',
      lastLogin: '5 days ago',
      avatarColor: '#90A4AE'
    }
  ];

  // Datos para las tarjetas de configuración
  masterConfigs: MasterConfig[] = [
    {
      title: 'Faculties',
      description: 'Manage university departments and institutional structures.',
      icon: 'fa-solid fa-university',
      actionText: 'Manage Records'
    },
    {
      title: 'Careers',
      description: 'Define and configure degree programs and academic requirements.',
      icon: 'fa-solid fa-graduation-cap',
      actionText: 'Manage Careers'
    },
    {
      title: 'Periods',
      description: 'Set up academic semesters, years, and active timeframes.',
      icon: 'fa-regular fa-calendar-check',
      actionText: 'Config Periods'
    },
    {
      title: 'Modes',
      description: 'Define thesis titulation formats and graduation pathways.',
      icon: 'fa-solid fa-book-open',
      actionText: 'Define Modes'
    }
  ];

  constructor() {}
}