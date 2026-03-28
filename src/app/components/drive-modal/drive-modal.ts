// src/app/components/drive-modal/drive-modal.ts
import { Component, EventEmitter, OnDestroy, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BackupAdminService,
  BackupMessageResponse,
  DriveAccountResponse,
  DriveAuthUrlResponse
} from '../../services/backup-dashboard/backup-dashboard';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-drive-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drive-modal.html',
  styleUrls: ['./drive-modal.css']
})
export class DriveModal implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>();

  isLoading = true;
  isLinking = false;
  isUnlinking = false;

  errorMessage = '';
  successMessage = '';

  activeAccount: DriveAccountResponse | null = null;

  private popupWatcher: number | null = null;
  private messageListener?: (event: MessageEvent) => void;

  constructor(
    private readonly backupAdminService: BackupAdminService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef // <-- INYECTADO AQUÍ
  ) {}

  ngOnInit(): void {
    this.loadActiveAccount();
  }

  ngOnDestroy(): void {
    this.clearPopupWatcher();
    this.removeMessageListener();
  }

  close(): void {
    this.closeModal.emit();
  }

  loadActiveAccount(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges(); // Forzar loader

    this.backupAdminService.getActiveDriveAccount().subscribe({
      next: (account: DriveAccountResponse) => {
        this.activeAccount = account;
        this.isLoading = false;
        this.cdr.detectChanges(); // <-- LA MAGIA
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        if (error.status === 400 || error.status === 404) {
          this.activeAccount = null;
          this.cdr.detectChanges(); // <-- LA MAGIA
          return;
        }
        this.errorMessage = this.extractErrorMessage(error);
        this.cdr.detectChanges(); // <-- LA MAGIA
      }
    });
  }

  connectGoogleDrive(): void {
    if (this.isLinking) return;

    const userId = this.authService.getUserId() || 3;
    this.isLinking = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.backupAdminService.getDriveAuthUrl(userId).subscribe({
      next: (response: DriveAuthUrlResponse) => {
        const authUrl = response.authorizationUrl;
        if (!authUrl) {
          this.isLinking = false;
          this.errorMessage = 'No se recibió la URL de autorización de Google Drive.';
          this.cdr.detectChanges();
          return;
        }
        this.openOAuthWindow(authUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.isLinking = false;
        this.errorMessage = this.extractErrorMessage(error);
        this.cdr.detectChanges(); // <-- LA MAGIA
      }
    });
  }

  unlinkGoogleDrive(): void {
    if (!this.activeAccount?.id || this.isUnlinking) return;

    const confirmed = window.confirm(`¿Desea desvincular la cuenta ${this.activeAccount.googleEmail || 'de Google Drive'}?`);
    if (!confirmed) return;

    const userId = this.authService.getUserId() || 3;

    this.isUnlinking = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.backupAdminService.unlinkDriveAccount(this.activeAccount.id, userId).subscribe({
      next: (response: BackupMessageResponse) => {
        this.isUnlinking = false;
        this.activeAccount = null;
        this.successMessage = response.message || 'Cuenta desvinculada correctamente.';
        this.cdr.detectChanges(); // <-- LA MAGIA
      },
      error: (error: HttpErrorResponse) => {
        this.isUnlinking = false;
        this.errorMessage = this.extractErrorMessage(error);
        this.cdr.detectChanges(); // <-- LA MAGIA
      }
    });
  }

  hasLinkedAccount(): boolean {
    return !!this.activeAccount?.id;
  }

  formatDate(value?: string): string {
    if (!value) return '--';
    return new Intl.DateTimeFormat('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }

  private openOAuthWindow(authUrl: string): void {
    const popup = window.open(authUrl, 'google-drive-oauth', 'width=640,height=760,menubar=no,toolbar=no,location=yes,status=no');

    if (!popup) {
      this.isLinking = false;
      this.errorMessage = 'No se pudo abrir la ventana de autorización. Verifique que el navegador permita popups.';
      this.cdr.detectChanges();
      return;
    }

    this.removeMessageListener();
    this.clearPopupWatcher();

    this.messageListener = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_DRIVE_LINKED') {
        this.clearPopupWatcher();
        this.removeMessageListener();
        try { popup.close(); } catch { }
        this.isLinking = false;
        this.successMessage = 'Cuenta de Google Drive vinculada correctamente.';
        this.loadActiveAccount(); // Internamente llama a detectChanges
      }
    };

    window.addEventListener('message', this.messageListener);

    this.popupWatcher = window.setInterval(() => {
      if (popup.closed) {
        this.clearPopupWatcher();
        this.removeMessageListener();
        if (this.isLinking) {
          this.isLinking = false;
          this.loadActiveAccount(); // Internamente llama a detectChanges
        }
      }
    }, 500);
  }

  private clearPopupWatcher(): void {
    if (this.popupWatcher !== null) { window.clearInterval(this.popupWatcher); this.popupWatcher = null; }
  }

  private removeMessageListener(): void {
    if (this.messageListener) { window.removeEventListener('message', this.messageListener); this.messageListener = undefined; }
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const backendError = error.error as { message?: string; error?: string } | string | null | undefined;
    if (typeof backendError === 'string' && backendError.trim()) return backendError;
    if (backendError && typeof backendError === 'object') {
      if (backendError.message) return backendError.message;
      if (backendError.error) return backendError.error;
    }
    return error.message || 'No se pudo completar la operación con Google Drive.';
  }
}