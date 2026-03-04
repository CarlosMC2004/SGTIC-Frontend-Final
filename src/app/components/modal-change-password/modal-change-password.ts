import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-change-password.html',
  styleUrls: ['./modal-change-password.css']
})
export class ChangePasswordModal implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isFirstLogin = false;
  isLoading = false;
  errorMessage = '';

  showCurrent = false;
  showNew = false;
  showRepeat = false;

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    ]],
    repeatPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.primerIngreso === false) {
      this.isFirstLogin = true;
    }
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const repeatPass = control.get('repeatPassword')?.value;
    
    if (newPass !== repeatPass && repeatPass !== '') {
      control.get('repeatPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    }
    
    const currentPass = control.get('currentPassword')?.value;
    if (newPass === currentPass && newPass !== '') {
      control.get('newPassword')?.setErrors({ sameAsOld: true });
      return { sameAsOld: true };
    }

    return null;
  }

  toggleVisibility(field: 'current' | 'new' | 'repeat') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'repeat') this.showRepeat = !this.showRepeat;
  }

  cerrarModal() {
    if (this.isFirstLogin) {
      this.authService.logout(); 
    } else {
      this.close.emit();
    }
  }

  guardar() {
    this.errorMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const newPasswordValue = this.passwordForm.value.newPassword;

    this.authService.changeFirstPassword(newPasswordValue).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (this.isFirstLogin) {
          const roles = this.authService.getCurrentUser()?.roles || [];
          
          if (roles.includes('estudiante')) {
            this.router.navigate(['/student/dashboard']);
          } else if (roles.includes('administrador_sgtic')) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.save.emit(response);
        }
        
        this.close.emit(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al actualizar la contraseña. Verifique su clave actual.';
      }
    });
  }
}