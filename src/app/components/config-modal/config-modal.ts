import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BackupAdminService,
  BackupConfigRequest,
  BackupConfigResponse,
  DriveAccountResponse
} from '../../services/backup-dashboard/backup-dashboard';

import { AuthService } from '../../services/auth.service';

interface ConfigFormModel {
  active: boolean;
  pgDumpPath: string;
  localPath: string;
  filePrefix: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  pgpassFilePath: string;
  cleanupEnabled: boolean;
  retentionDays: number;
  driveEnabled: boolean;
  driveAccountId: number | null;
  driveFolderId: string;
}

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-modal.html',
  styleUrls: ['./config-modal.css']
})
export class ConfigModal implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  configId: number | null = null;

  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  activeDriveEmail = '';
  activeDriveId: number | null = null;

  config: ConfigFormModel = {
    active: true,
    pgDumpPath: '',
    localPath: '',
    filePrefix: 'sgtic',
    databaseHost: '',
    databasePort: 5432,
    databaseName: '',
    databaseUser: '',
    pgpassFilePath: '',
    cleanupEnabled: true,
    retentionDays: 7,
    driveEnabled: false,
    driveAccountId: null,
    driveFolderId: ''
  };

  constructor(
    private readonly backupAdminService: BackupAdminService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConfig();
    this.loadActiveDriveAccount();
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.isSaving) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'No se pudo identificar al usuario autenticado.';
      return;
    }

    if (!this.isValidForm()) {
      return;
    }

    this.isSaving = true;

    const request: BackupConfigRequest = {
      userId,
      active: this.config.active,
      pgDumpPath: this.normalizeString(this.config.pgDumpPath),
      localPath: this.config.localPath.trim(),
      filePrefix: this.config.filePrefix.trim(),
      databaseHost: this.config.databaseHost.trim(),
      databasePort: Number(this.config.databasePort),
      databaseName: this.config.databaseName.trim(),
      databaseUser: this.config.databaseUser.trim(),
      pgpassFilePath: this.normalizeString(this.config.pgpassFilePath),
      cleanupEnabled: this.config.cleanupEnabled,
      retentionDays: Number(this.config.retentionDays),
      driveEnabled: this.config.driveEnabled,
      driveAccountId: this.config.driveEnabled ? this.config.driveAccountId : null,
      driveFolderId: this.config.driveEnabled ? this.normalizeString(this.config.driveFolderId) : null
    };

    const request$ = this.configId
      ? this.backupAdminService.updateConfig(this.configId, request)
      : this.backupAdminService.createConfig(request);

    request$.subscribe({
      next: (_response: BackupConfigResponse) => {
        this.isSaving = false;
        this.successMessage = 'Configuración guardada correctamente.';
        setTimeout(() => this.close(), 500);
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private loadConfig(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.backupAdminService.getActiveConfig().subscribe({
      next: (response: BackupConfigResponse) => {
        this.configId = response.id;

        this.config = {
          active: !!response.active,
          pgDumpPath: response.pgDumpPath ?? '',
          localPath: response.localPath ?? '',
          filePrefix: response.filePrefix ?? 'sgtic',
          databaseHost: response.databaseHost ?? '',
          databasePort: response.databasePort ?? 5432,
          databaseName: response.databaseName ?? '',
          databaseUser: response.databaseUser ?? '',
          pgpassFilePath: response.pgpassFilePath ?? '',
          cleanupEnabled: !!response.cleanupEnabled,
          retentionDays: response.retentionDays ?? 7,
          driveEnabled: !!response.driveEnabled,
          driveAccountId: response.driveAccountId ?? null,
          driveFolderId: response.driveFolderId ?? ''
        };

        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        if (error.status === 404) {
          return;
        }

        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private loadActiveDriveAccount(): void {
    this.backupAdminService.getActiveDriveAccount().subscribe({
      next: (account: DriveAccountResponse) => {
        this.activeDriveEmail = account.googleEmail ?? '';
        this.activeDriveId = account.id ?? null;

        if (!this.config.driveAccountId && this.activeDriveId) {
          this.config.driveAccountId = this.activeDriveId;
        }
      },
      error: () => {
        this.activeDriveEmail = '';
        this.activeDriveId = null;
      }
    });
  }

  private isValidForm(): boolean {
    if (!this.config.localPath.trim()) {
      this.errorMessage = 'La ruta local es obligatoria.';
      return false;
    }

    if (!this.config.filePrefix.trim()) {
      this.errorMessage = 'El prefijo del archivo es obligatorio.';
      return false;
    }

    if (!this.config.databaseHost.trim()) {
      this.errorMessage = 'El host de la base de datos es obligatorio.';
      return false;
    }

    if (!this.config.databasePort || Number(this.config.databasePort) <= 0) {
      this.errorMessage = 'El puerto de la base de datos no es válido.';
      return false;
    }

    if (!this.config.databaseName.trim()) {
      this.errorMessage = 'El nombre de la base de datos es obligatorio.';
      return false;
    }

    if (!this.config.databaseUser.trim()) {
      this.errorMessage = 'El usuario de la base de datos es obligatorio.';
      return false;
    }

    if (this.config.cleanupEnabled && Number(this.config.retentionDays) <= 0) {
      this.errorMessage = 'Los días de retención deben ser mayores que 0.';
      return false;
    }

    if (this.config.driveEnabled && !this.config.driveAccountId) {
      this.errorMessage = 'Debe indicar una cuenta de Google Drive activa.';
      return false;
    }

    return true;
  }

  private normalizeString(value: string | null | undefined): string | null {
    const cleaned = (value ?? '').trim();
    return cleaned ? cleaned : null;
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const backendError = error.error as { message?: string; error?: string } | string | null | undefined;

    if (typeof backendError === 'string' && backendError.trim()) {
      return backendError;
    }

    if (backendError && typeof backendError === 'object') {
      if (backendError.message) return backendError.message;
      if (backendError.error) return backendError.error;
    }

    return error.message || 'No se pudo guardar la configuración.';
  }
}