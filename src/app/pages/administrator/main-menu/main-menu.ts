import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';

interface UserData {
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatarColor: string;
}

interface MasterData {
  title: string;
  icon: string;
  description: string; // Agregada
  actionText: string;  // Agregada
  colorClass?: string; // El '?' la hace opcional por si no todos la usan
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class MenuPrincipalAdminComponent {

  recentUsers: UserData[] = [
    {
      name: 'Ana Martinez',
      email: 'ana.m@university.edu',
      role: 'STUDENT',
      status: 'Active',
      lastLogin: '2 hours ago',
      avatarColor: '#ff8a65'
    },
    {
      name: 'Dr. Robert Chen',
      email: 'r.chen@university.edu',
      role: 'TEACHER',
      status: 'Active',
      lastLogin: '1 day ago',
      avatarColor: '#ba68c8'
    },
    {
      name: 'Marco Polo',
      email: 'marco.p@university.edu',
      role: 'ADMIN',
      status: 'Inactive',
      lastLogin: '5 days ago',
      avatarColor: '#90a4ae'
    }
  ];

  masterConfigs: MasterData[] = [
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
