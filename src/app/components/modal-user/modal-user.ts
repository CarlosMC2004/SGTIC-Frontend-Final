import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleDTO, CareerDTO, AcademicPeriodDTO } from '../../models/user.model';

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
  availableCareers: CareerDTO[] = [];
  availablePeriods: AcademicPeriodDTO[] = [];

  loading = false;
  errorMessage = '';
  isStudentSelected = false;

  userData = {
    identification: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    roleIds: [] as number[],
    active: true,
    idCareer: null as number | null,
    idPeriod: null as number | null
  };

  isEditing = false;
  showPassword = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadRoles();
    this.loadCareers();
    this.loadPeriods();

    if (this.user) {
      this.isEditing = true;
      this.userData = {
        identification: this.user.identification,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        username: this.user.username || '',
        password: '',
        roleIds: this.mapRolesToIds(this.user.roles),
        active: this.user.active,
        idCareer: this.user.idCareer || null,
        idPeriod: this.user.idPeriod || null
      };

      // Verificar si ya tiene rol estudiante en edición
      this.checkIfStudentSelected();
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

  loadCareers() {
    this.userService.getActiveCareers().subscribe({
      next: (careers) => {
        this.availableCareers = careers;
      },
      error: (err) => {
        console.error('Error cargando carreras:', err);
      }
    });
  }

  loadPeriods() {
    this.userService.getActivePeriods().subscribe({
      next: (periods) => {
        this.availablePeriods = periods;
      },
      error: (err) => {
        console.error('Error cargando períodos:', err);
      }
    });
  }

  mapRolesToIds(roleNames: string[] = []): number[] {
    if (!roleNames || !this.availableRoles.length) return [];
    return this.availableRoles
      .filter(r => roleNames.includes(r.name))
      .map(r => r.id);
  }

  checkIfStudentSelected() {
    const studentRole = this.availableRoles.find(r => r.name === 'estudiante');
    if (studentRole) {
      this.isStudentSelected = this.userData.roleIds.includes(studentRole.id);
    }
  }

  toggleRole(roleId: number) {
    const role = this.availableRoles.find(r => r.id === roleId);
    if (!role) return;

    if (role.name === 'estudiante' && !this.isRoleSelected(roleId)) {
      this.userData.roleIds = [roleId];
      this.isStudentSelected = true;
      return;
    }

    if (this.isRoleSelected(roleId)) {
      const index = this.userData.roleIds.indexOf(roleId);
      if (index > -1) this.userData.roleIds.splice(index, 1);
      if (role.name === 'estudiante') this.isStudentSelected = false;
    } else {
      if (role.name === 'estudiante') {
        this.userData.roleIds = [roleId];
        this.isStudentSelected = true;
      } else {
        const studentRole = this.availableRoles.find(r => r.name === 'estudiante');
        if (studentRole) {
          const studentIndex = this.userData.roleIds.indexOf(studentRole.id);
          if (studentIndex > -1) {
            this.userData.roleIds.splice(studentIndex, 1);
            this.isStudentSelected = false;
          }
        }
        this.userData.roleIds.push(roleId);
      }
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
    // Validaciones básicas
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

    // Validación específica para estudiantes
    if (this.isStudentSelected && (!this.userData.idCareer || !this.userData.idPeriod)) {
      this.errorMessage = 'Debe seleccionar la carrera y período académico para el estudiante';
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
      roleIds: this.userData.roleIds,
      idCareer: this.userData.idCareer,
      idPeriod: this.userData.idPeriod
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
