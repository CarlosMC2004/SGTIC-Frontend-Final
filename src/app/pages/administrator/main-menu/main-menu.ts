import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';
import { RouterModule } from '@angular/router';

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
  description: string;
  actionText: string;
  colorClass?: string;
  route: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterModule],
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
      icon: 'domain',
      actionText: 'Manage Records',
      route: '/admin/faculties' // ✅ Agregado
    },
    {
      title: 'Careers',
      description: 'Define and configure degree programs and academic requirements.',
      icon: 'school',
      actionText: 'Manage Careers',
      route: '/admin/careers' //
    },
    {
      title: 'Periods',
      description: 'Set up academic semesters, years, and active timeframes.',
      icon: 'calendar_month',
      actionText: 'Config Periods',
      route: '/admin/periods'
    },
    {
      title: 'Modes',
      description: 'Define thesis titulation formats and graduation pathways.',
      icon: 'description',
      actionText: 'Define Modes',
      route: '/admin/configuration'
    }
  ];

  constructor() {}
}
