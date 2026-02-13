import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  id_usuario?: number;
  identificacion: string; // DB: identificacion
  nombres: string;        // DB: nombres
  apellidos: string;      // DB: apellidos
  correo: string;         // DB: correo
  activo: boolean;        // DB: activo
  roles: string[];        // Para manejar usuario_rol
  username?: string;      // DB: credencial.username
  password?: string;      // DB: credencial.password_hash (solo para input)
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit User' : 'New User' }}</h2>
          <button class="btn-close" (click)="onClose()">×</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>ID Number (DNI)</label>
              <input [(ngModel)]="userData.identificacion" placeholder="Ex: 1720..." type="text">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input [(ngModel)]="userData.correo" placeholder="user@college.edu" type="email">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input [(ngModel)]="userData.nombres" type="text">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input [(ngModel)]="userData.apellidos" type="text">
            </div>
          </div>

          <div class="section-title">Credentials</div>
          <div class="form-row">
            <div class="form-group">
              <label>Username</label>
              <input [(ngModel)]="userData.username" placeholder="jdoe" type="text">
            </div>
            <div class="form-group">
              <label>Password {{ isEditing ? '(Leave empty to keep)' : '*' }}</label>
              <input [(ngModel)]="userData.password" type="password">
            </div>
          </div>

          <div class="section-title">Roles</div>
          <div class="roles-grid">
            <div *ngFor="let role of availableRoles" 
                 class="role-item" 
                 [class.selected]="userData.roles.includes(role)"
                 (click)="toggleRole(role)">
              <span class="material-symbols-outlined check-icon">
                {{ userData.roles.includes(role) ? 'check_circle' : 'circle' }}
              </span>
              {{ role }}
            </div>
          </div>

          <div class="form-group toggle-group">
            <label>Active Status</label>
            <div class="toggle-switch" [class.active]="userData.activo" (click)="userData.activo = !userData.activo">
              <div class="toggle-circle"></div>
            </div>
           </div>

        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="onClose()">Cancel</button>
          <button class="btn-save" (click)="onSave()">Save User</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Reuse styles from previous modal, customized for forms */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px); }
    .modal-container { background: white; width: 500px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; animation: fadeIn 0.3s; }
    .modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { margin: 0; font-size: 18px; color: #333; }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
    
    .modal-body { padding: 20px; max-height: 70vh; overflow-y: auto; }
    .form-row { display: flex; gap: 15px; margin-bottom: 15px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #555; }
    .form-group input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .form-group input:focus { border-color: #27684a; outline: none; }
    
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 15px 0 10px; font-weight: 700; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    
    .roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
    .role-item { display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid #eee; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .role-item:hover { background: #f9f9f9; }
    .role-item.selected { background: #e8f5e9; border-color: #27684a; color: #1b5e20; }
    .check-icon { font-size: 18px; }

    .toggle-switch { width: 40px; height: 22px; background: #ddd; border-radius: 20px; position: relative; cursor: pointer; transition: 0.3s; }
    .toggle-switch.active { background: #27684a; }
    .toggle-circle { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; }
    .toggle-switch.active .toggle-circle { transform: translateX(18px); }

    .modal-footer { padding: 15px 20px; background: #f9f9f9; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-cancel { background: none; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px; cursor: pointer; color: #666; }
    .btn-save { background: #27684a; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; color: white; font-weight: 500; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class UserModalComponent {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<User>();
  @Output() close = new EventEmitter<void>();

  availableRoles = ['Admin', 'Coordinator', 'Teacher', 'Student']; // Mock from DB table 'rol'
  
  userData: User = {
    identificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    activo: true,
    roles: [],
    username: '',
    password: ''
  };

  isEditing = false;

  ngOnInit() {
    if (this.user) {
      this.userData = { ...this.user }; // Clone to avoid direct mutation
      this.isEditing = true;
    }
  }

  toggleRole(role: string) {
    if (this.userData.roles.includes(role)) {
      this.userData.roles = this.userData.roles.filter(r => r !== role);
    } else {
      this.userData.roles.push(role);
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    // Basic validation
    if (!this.userData.nombres || !this.userData.identificacion) return;
    this.save.emit(this.userData);
  }
}