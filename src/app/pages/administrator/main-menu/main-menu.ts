import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar'; // Asegúrate de que la ruta sea correcta

interface UserData {
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  initial: string; // Para el avatar si no hay imagen
  color: string;   // Color del avatar
}

interface MasterData {
  title: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class AdminDashboardComponent {
  
  // Datos simulados para la tabla
  recentUsers: UserData[] = [
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