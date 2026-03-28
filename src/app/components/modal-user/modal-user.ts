import {Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import {RoleDTO, CareerDTO, AcademicPeriodDTO, FacultyDTO, SelectionItemDTO} from '../../models/user.model';

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

  // Catálogos
  availableRoles: RoleDTO[] = [];
  availableFaculties: SelectionItemDTO[] = [];
  availableCareers: SelectionItemDTO[] = [];
  availablePeriods: AcademicPeriodDTO[] = [];

  // Banderas de UI
  loading = false;
  errorMessage = '';
  showPassword = false;
  isEditing = false;
  private cdr = inject(ChangeDetectorRef);

  // Banderas de Lógica de Roles
  showFacultySelect = false;
  showCareerSelect = false;
  showPeriodSelect = false;

  // Objeto de Datos Reactivo
  userData = {
    identification: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    roleIds: [] as number[],
    active: true,
    idFaculty: null as number | null,
    idCareer: null as number | null,
    idPeriod: null as number | null
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadRoles();
    this.loadFaculties();
    this.loadPeriods();
    this.cdr.detectChanges();

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
        idFaculty: this.user.idFaculty || null,
        idCareer: this.user.idCareer || null,
        idPeriod: this.user.idPeriod || null,
      };

      if (this.userData.idFaculty) {
        this.loadCareersForFaculty(this.userData.idFaculty);
      }
      this.checkRoleDependencies();
    }
  }

  // ==========================================
  // CARGA DE CATÁLOGOS
  // ==========================================
  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (roles) => this.availableRoles = roles,
      error: (err) => console.error('Error cargando roles:', err)
    });
    this.cdr.detectChanges();
  }

  loadPeriods() {
    this.userService.getActivePeriods().subscribe({
      next: (periods) => this.availablePeriods = periods,
      error: (err) => console.error('Error cargando períodos:', err)
    });
  }

  loadFaculties() {
    this.userService.getFaculties().subscribe({
      next: (facs) => this.availableFaculties = facs,
      error: (err) => console.error('Error cargando facultades:', err)
    });
  }

  onFacultyChange() {
    this.userData.idCareer = null;
    this.availableCareers = [];
    if (this.userData.idFaculty) {
      this.loadCareersForFaculty(this.userData.idFaculty);
    }
  }

  private loadCareersForFaculty(facultyId: number) {
    this.userService.getCareersByFaculty(facultyId).subscribe({
      next: (careers) => this.availableCareers = careers,
      error: (err) => console.error('Error cargando carreras:', err)
    });
  }

  // ==========================================
  // LÓGICA DE ROLES (CORREGIDA)
  // ==========================================
  toggleRole(role: RoleDTO) {
    const index = this.userData.roleIds.indexOf(role.id);
    if (index > -1) {
      this.userData.roleIds.splice(index, 1);
    } else {
      this.userData.roleIds.push(role.id);
    }
    this.checkRoleDependencies();
  }

  checkRoleDependencies() {
    const selectedRoles = this.availableRoles
      .filter(r => this.userData.roleIds.includes(r.id))
      .map(r => r.name.toLowerCase());

    // 1. Roles que obligan a ser docente (usamos includes para evitar problemas de guiones/espacios)
    const requiresDocente = selectedRoles.some(name =>
      name.includes('director') ||
      name.includes('tribunal') ||
      name.includes('comision') ||
      name.includes('coordinador')
    );

    const docenteRole = this.availableRoles.find(r => r.name.toLowerCase().includes('docente'));
    if (requiresDocente && docenteRole && !this.userData.roleIds.includes(docenteRole.id)) {
      this.userData.roleIds.push(docenteRole.id);
      selectedRoles.push('docente');
    }

    // 2. Evaluamos banderas usando includes (Super seguro contra cambios de texto)
    const isEstudiante = selectedRoles.some(r => r.includes('estudiante'));
    const isDocente = selectedRoles.some(r => r.includes('docente'));
    const isCoordFacultad = selectedRoles.some(r => r.includes('coordinador') && r.includes('facultad'));
    const isCoordCarrera = selectedRoles.some(r => r.includes('coordinador') && r.includes('carrera'));

    this.showFacultySelect = isEstudiante || isDocente || isCoordFacultad || isCoordCarrera;
    this.showCareerSelect = isEstudiante || isDocente || isCoordCarrera;
    this.showPeriodSelect = isEstudiante;

    // 3. Limpiar datos si los campos se ocultan
    if (!this.showFacultySelect) this.userData.idFaculty = null;
    if (!this.showCareerSelect) this.userData.idCareer = null;
    if (!this.showPeriodSelect) this.userData.idPeriod = null;
  }

  isDocenteForced(): boolean {
    const selectedRoles = this.availableRoles
      .filter(r => this.userData.roleIds.includes(r.id))
      .map(r => r.name.toLowerCase());

    return selectedRoles.some(name =>
      name.includes('director') ||
      name.includes('tribunal') ||
      name.includes('comision') ||
      name.includes('coordinador')
    );
  }

  getRoleIcon(roleName: string): string {
    const name = roleName.toLowerCase();
    if (name.includes('estudiante')) return 'school';
    if (name.includes('docente')) return 'history_edu';
    if (name.includes('director')) return 'assignment_ind';
    if (name.includes('coordinador') && name.includes('facultad')) return 'account_balance';
    if (name.includes('coordinador') && name.includes('carrera')) return 'menu_book';
    if (name.includes('comision') || name.includes('tribunal')) return 'gavel';
    if (name.includes('admin')) return 'admin_panel_settings';
    return 'person';
  }

  // ==========================================
  // UTILIDADES Y ENVÍO
  // ==========================================
  mapRolesToIds(roleNames: string[] = []): number[] {
    if (!roleNames || !this.availableRoles.length) return [];
    return this.availableRoles
      .filter(r => roleNames.includes(r.name))
      .map(r => r.id);
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
    if (!this.userData.identification || !this.userData.firstName ||
      !this.userData.lastName || !this.userData.email ||
      !this.userData.username || (!this.isEditing && !this.userData.password)) {
      this.errorMessage = 'Todos los campos personales son obligatorios.';
      return;
    }

    if (this.userData.roleIds.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un rol.';
      return;
    }

    if (this.showFacultySelect && !this.userData.idFaculty) {
      this.errorMessage = 'Debe seleccionar una facultad para los roles asignados.';
      return;
    }

    if (this.showCareerSelect && !this.userData.idCareer) {
      this.errorMessage = 'Debe seleccionar una carrera para los roles asignados.';
      return;
    }

    if (this.showPeriodSelect && !this.userData.idPeriod) {
      this.errorMessage = 'Debe seleccionar el período académico para el estudiante.';
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
      idFaculty: this.userData.idFaculty,
      idCareer: this.userData.idCareer,
      idPeriod: this.userData.idPeriod
    };

    this.userService.createUser(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.userId) {
          this.save.emit();
        } else if (response.success === false) {
          this.errorMessage = response.message || 'Error al guardar usuario.';
        } else {
          this.save.emit();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error?.error || 'Error de conexión con el servidor.';
      }
    });
  }
}
