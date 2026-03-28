import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';

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
export class MainMenuComponent implements OnInit {

  recentUsers: any[] = [];

  masterConfigs: MasterData[] = [
    {
      title: 'Facultades',
      description: 'Gestiona las facultades y estructuras institucionales de la universidad.',
      icon: 'domain',
      actionText: 'Gestionar Facultades',
      route: '/admin/structure'
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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
  this.userService.getUsers().subscribe({
    next: (users) => {
      this.recentUsers = users
        .filter(u => u.lastLogin)
        .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
        .slice(0, 5);
    },
    error: (err) => console.error('Error al cargar usuarios:', err)
  });
}

  getInitials(firstName: string, lastName: string): string {
    const f = firstName?.charAt(0) || '';
    const l = lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '?';
  }

  getAvatarColor(role: string): string {
    const r = typeof role === 'string' ? role : (role as any)?.name || (role as any)?.nombre || '';
    const colors: { [key: string]: string } = {
      'estudiante': '#ff8a65',
      'docente': '#ba68c8',
      'administrador_sgtic': '#90a4ae',
      'coordinador_carrera': '#4db6ac',
      'coordinador_facultad': '#64b5f6',
      'director_trabajo_titulacion': '#81c784'
    };
    return colors[r.toLowerCase()] || '#90a4ae';
  }

  getRolLabel(roles: any[]): string {
    if (!roles || roles.length === 0) return 'SIN ROL';
    const role = typeof roles[0] === 'string' ? roles[0] : roles[0]?.name || roles[0]?.nombre || '';
    const labels: { [key: string]: string } = {
      'estudiante': 'ESTUDIANTE',
      'docente': 'DOCENTE',
      'administrador_sgtic': 'ADMIN',
      'coordinador_carrera': 'COORDINADOR',
      'coordinador_facultad': 'COORDINADOR',
      'director_trabajo_titulacion': 'DIRECTOR'
    };
    return labels[role.toLowerCase()] || role.toUpperCase();
  }
}