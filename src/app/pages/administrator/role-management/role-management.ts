import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserRole {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  username: string;
  roles: string[];
  activo: boolean;
  avatarColor: string;
}

interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
  usuariosAsignados: number;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-management.html',
  styleUrls: ['./role-management.css']
})
export class RoleManagementComponent {
  activeTab: 'assign' | 'create' = 'assign';
  searchText = '';
  selectedRole: string = '';

  // Mock data - Usuarios
  users: UserRole[] = [
    {
      id: 1,
      nombres: 'Carlos',
      apellidos: 'Ramirez',
      correo: 'admin@sgtt.edu',
      username: 'cramirez',
      roles: ['Administrador'],
      activo: true,
      avatarColor: '#1b5e20'
    },
    {
      id: 2,
      nombres: 'Maria',
      apellidos: 'Gonzalez',
      correo: 'maria.gonzalez@sgtt.edu',
      username: 'mgonzalez',
      roles: ['Docente', 'Coordinador'],
      activo: true,
      avatarColor: '#1976d2'
    },
    {
      id: 3,
      nombres: 'Juan',
      apellidos: 'Perez',
      correo: 'juan.perez@student.edu',
      username: 'jperez22',
      roles: ['Estudiante'],
      activo: false,
      avatarColor: '#f57c00'
    }
  ];

  // Mock data - Roles disponibles
  availableRoles: Role[] = [
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Control total del sistema',
      permisos: ['Crear usuarios', 'Eliminar usuarios', 'Configurar sistema', 'Ver reportes'],
      usuariosAsignados: 1
    },
    {
      id: 2,
      nombre: 'Coordinador',
      descripcion: 'Gestión de facultades y carreras',
      permisos: ['Gestionar carreras', 'Asignar docentes', 'Ver proyectos', 'Aprobar temas'],
      usuariosAsignados: 2
    },
    {
      id: 3,
      nombre: 'Docente',
      descripcion: 'Tutorías y dirección de trabajos',
      permisos: ['Ver estudiantes asignados', 'Subir calificaciones', 'Agregar tutorías'],
      usuariosAsignados: 5
    },
    {
      id: 4,
      nombre: 'Estudiante',
      descripcion: 'Acceso a proyectos de titulación',
      permisos: ['Subir documentos', 'Ver notificaciones', 'Solicitar tutorías'],
      usuariosAsignados: 45
    }
  ];

  // Permisos de BD disponibles para crear nuevo rol
  bdPermissions: string[] = [
    'SELECT facultad', 'INSERT facultad', 'UPDATE facultad', 'DELETE facultad',
    'SELECT carrera', 'INSERT carrera', 'UPDATE carrera', 'DELETE carrera',
    'SELECT usuario', 'INSERT usuario', 'UPDATE usuario', 'DELETE usuario',
    'SELECT docente', 'INSERT docente', 'UPDATE docente',
    'SELECT estudiante', 'INSERT estudiante', 'UPDATE estudiante',
    'SELECT periodo_academico', 'INSERT periodo_academico', 'UPDATE periodo_academico',
    'SELECT opcion_titulacion', 'INSERT opcion_titulacion', 'UPDATE opcion_titulacion',
    'SELECT trabajo_titulacion', 'INSERT trabajo_titulacion', 'UPDATE trabajo_titulacion'
  ];

  newRole = {
    nombre: '',
    descripcion: '',
    permisos: [] as string[]
  };

  get filteredUsers() {
    return this.users.filter(u =>
      u.nombres.toLowerCase().includes(this.searchText.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(this.searchText.toLowerCase()) ||
      u.correo.toLowerCase().includes(this.searchText.toLowerCase()) ||
      u.username.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleRole(userId: number, role: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const index = user.roles.indexOf(role);
      if (index > -1) {
        user.roles.splice(index, 1);
      } else {
        user.roles.push(role);
      }
    }
  }

  hasRole(user: UserRole, role: string): boolean {
    return user.roles.includes(role);
  }

  createNewRole() {
    if (this.newRole.nombre && this.newRole.descripcion) {
      this.availableRoles.push({
        id: this.availableRoles.length + 1,
        nombre: this.newRole.nombre,
        descripcion: this.newRole.descripcion,
        permisos: [...this.newRole.permisos],
        usuariosAsignados: 0
      });

      // Reset form
      this.newRole = {
        nombre: '',
        descripcion: '',
        permisos: []
      };

      this.activeTab = 'assign';
    }
  }

  togglePermission(permiso: string) {
    const index = this.newRole.permisos.indexOf(permiso);
    if (index > -1) {
      this.newRole.permisos.splice(index, 1);
    } else {
      this.newRole.permisos.push(permiso);
    }
  }
}
