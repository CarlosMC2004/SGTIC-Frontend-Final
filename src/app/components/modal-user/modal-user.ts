import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleDTO } from '../../models/user.model';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-user.html',
  styleUrls: ['./modal-user.css']
})
export class UserModalComponent implements OnInit {
  @Input() user: any = null;
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  availableRoles: RoleDTO[] = [];
  loading = false;
  errorMessage = '';

  userData = {
    identification: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    roleIds: [] as number[],
    active: true
  };

  isEditing = false;
  showPassword = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadRoles();

    if (this.user) {
      this.isEditing = true;
      this.userData = {
        identification: this.user.identification,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        username: this.user.username || '',
        password: '',
        roleIds: [], // Mapear desde nombres a IDs si es edición
        active: this.user.active
      };
    }
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (err) => {
        console.error('Error cargando roles:', err);
      }
    });
  }

  toggleRole(roleId: number) {
    const index = this.userData.roleIds.indexOf(roleId);
    if (index > -1) {
      this.userData.roleIds.splice(index, 1);
    } else {
      this.userData.roleIds.push(roleId);
    }
  }

  isRoleSelected(roleId: number): boolean {
    return this.userData.roleIds.includes(roleId);
  }

  generateUsername() {
    if (this.userData.firstName && this.userData.lastName && !this.userData.username) {
      const first = this.userData.firstName.charAt(0).toLowerCase();
      const last = this.userData.lastName.toLowerCase().replace(/\s+/g, '');
      this.userData.username = first + last;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    // Validaciones
    if (!this.userData.identification || !this.userData.firstName ||
      !this.userData.lastName || !this.userData.email ||
      !this.userData.username || (!this.isEditing && !this.userData.password)) {
      this.errorMessage = 'Todos los campos obligatorios deben completarse';
      return;
    }

    if (this.userData.roleIds.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un rol';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request = {
      identification: this.userData.identification,
      firstName: this.userData.firstName,
      lastName: this.userData.lastName,
      email: this.userData.email,
      username: this.userData.username,
      password: this.userData.password,
      roleIds: this.userData.roleIds
    };

    this.userService.createUser(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.save.emit();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al crear usuario';
      }
    });
  }
}
