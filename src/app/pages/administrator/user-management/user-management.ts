import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserModalComponent } from '../../../components/modal-user/modal-user';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, UserModalComponent],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;
  showModal = false;
  selectedUser: User | null = null;
  searchText = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.loading = false;
      }
    });
  }

  get filteredUsers() {
    if (!this.searchText) return this.users;

    const term = this.searchText.toLowerCase();
    return this.users.filter(u =>
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.identification?.includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  }

  getActiveCount() {
    return this.users.filter(u => u.active).length;
  }

  openModal(user?: User) {
    this.selectedUser = user || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  handleSave() {
    this.closeModal();
    this.loadUsers(); // Recargar lista después de crear/editar
  }
}
