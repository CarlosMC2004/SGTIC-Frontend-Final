import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-change-password.html',
  styleUrls: ['./modal-change-password.css']
})
export class ChangePasswordModal {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  // Controladores para mostrar/ocultar cada campo
  showCurrent = false;
  showNew = false;
  showRepeat = false;

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/) // Al menos mayúscula, minúscula y número
    ]],
    repeatPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  // Validador personalizado para confirmar que las contraseñas coincidan
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const repeatPass = control.get('repeatPassword')?.value;
    if (newPass !== repeatPass && repeatPass !== '') {
      return { passwordsMismatch: true };
    }
    return null;
  }

  toggleVisibility(field: 'current' | 'new' | 'repeat') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'repeat') this.showRepeat = !this.showRepeat;
  }

  cerrarModal() {
    this.close.emit();
  }

  guardar() {
    if (this.passwordForm.valid) {
      this.save.emit(this.passwordForm.value);
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }
}