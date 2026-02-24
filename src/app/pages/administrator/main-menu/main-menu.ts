import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface UserData {
  name: string;
  email: string;
  role: 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN';
  status: 'Activo' | 'Inactivo';
  lastLogin: string;
  avatarColor: string;
}

interface MasterData {
  title: string;
  icon: string;
  description: string;
  actionText: string;
  route: string;
}

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-menu.html',
  styleUrls: ['./main-menu.css']
})
export class MainMenuComponent {

  recentUsers: UserData[] = [
    {
      name: 'Ana Martínez',
      email: 'ana.m@uteq.edu.ec',
      role: 'ESTUDIANTE',
      status: 'Activo',
      lastLogin: 'Hace 2 horas',
      avatarColor: '#ff8a65'
    },
    {
      name: 'Dr. Roberto Chen',
      email: 'r.chen@uteq.edu.ec',
      role: 'DOCENTE',
      status: 'Activo',
      lastLogin: 'Hace 1 día',
      avatarColor: '#ba68c8'
    },
    {
      name: 'Marco Polo',
      email: 'marco.p@uteq.edu.ec',
      role: 'ADMIN',
      status: 'Inactivo',
      lastLogin: 'Hace 5 días',
      avatarColor: '#90a4ae'
    }
  ];

  masterConfigs: MasterData[] = [
    {
      title: 'Facultades',
      description: 'Gestiona las facultades y estructuras institucionales de la universidad.',
      icon: 'domain',
      actionText: 'Gestionar Facultades',
      route: '/admin/structure' // Ruta a estructura institucional
    },
    {
      title: 'Carreras',
      description: 'Configura las carreras, programas y requisitos académicos.',
      icon: 'school',
      actionText: 'Gestionar Carreras',
      route: '/admin/configuration'
    },
    {
      title: 'Períodos Académicos',
      description: 'Administra semestres, años académicos y períodos activos.',
      icon: 'calendar_month',
      actionText: 'Configurar Períodos',
      route: '/admin/configuration'
    },
    {
      title: 'Opciones de Titulación',
      description: 'Define las modalidades y vías de titulación disponibles.',
      icon: 'description',
      actionText: 'Definir Modos',
      route: '/admin/configuration'
    }
  ];

  constructor() {}
}
