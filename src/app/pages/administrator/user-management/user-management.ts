import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { UserModalComponent, User } from './../../../components/modal-user/modal-user';
import {HeaderComponent} from '../../../components/header/header';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, UserModalComponent, HeaderComponent],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent {

  showModal = false;
  selectedUser: User | null = null;
  searchText = '';

  // Mock Data (Simulando tabla 'usuario' + 'usuario_rol' + 'credencial')
  users: User[] = [
    {
      id_usuario: 1,
      identificacion: '0928374102',
      nombres: 'Carlos',
      apellidos: 'Ramirez',
      correo: 'admin@sgtt.edu',
      activo: true,
      username: 'cramirez',
      roles: ['Admin']
    },
    {
      id_usuario: 2,
      identificacion: '1203948571',
      nombres: 'Maria',
      apellidos: 'Gonzalez',
      correo: 'maria.gonzalez@sgtt.edu',
      activo: true,
      username: 'mgonzalez',
      roles: ['Teacher', 'Coordinator']
    },
    {
      id_usuario: 3,
      identificacion: '1728394012',
      nombres: 'Juan',
      apellidos: 'Perez',
      correo: 'juan.perez@student.edu',
      activo: false,
      username: 'jperez22',
      roles: ['Student']
    }
  ];

  get filteredUsers() {
    return this.users.filter(u =>
      u.nombres.toLowerCase().includes(this.searchText.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(this.searchText.toLowerCase()) ||
      u.identificacion.includes(this.searchText) ||
      u.correo.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getActiveCount() {
    return this.users.filter(u => u.activo).length;
  }

  openModal(user?: User) {
    this.selectedUser = user ? { ...user } : null; // Clone or new
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  handleSave(userData: User) {
    if (this.selectedUser) {
      // Edit Mode (Simulación de UPDATE)
      const index = this.users.findIndex(u => u.id_usuario === userData.id_usuario);
      if (index !== -1) {
        this.users[index] = userData;
      }
    } else {
      // Create Mode (Simulación de INSERT)
      userData.id_usuario = this.users.length + 1; // Mock ID
      // If no username, generate one automatically
      if(!userData.username) {
        userData.username = (userData.nombres.charAt(0) + userData.apellidos).toLowerCase();
      }
      this.users.push(userData);
    }
    this.closeModal();
  }
}
