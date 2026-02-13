import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';

interface User {
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatarColor: string;
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
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class MenuPrincipalAdminComponent {

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
