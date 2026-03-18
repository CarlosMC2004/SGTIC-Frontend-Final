import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of, throwError } from 'rxjs';

import {
  BackupAdminService,
  BackupConfigResponse,
  BackupMessageResponse,
  BackupScheduleRequest,
  BackupScheduleResponse
} from '../../services/backup-dashboard/backup-dashboard';
import { AuthService } from '../../services/auth.service';

type BackupType = 'FULL' | 'DIFFERENTIAL' | 'INCREMENTAL';
type FrequencyType = 'DAILY' | 'WEEKLY';

interface WeekDayOption {
  label: string;
  value: string;
}

interface TaskFormModel {
  name: string;
  backupType: BackupType;
  frequency: FrequencyType;
  dayOfWeek: string;
  executionTime: string;
  active: boolean;
}

@Component({
  selector: 'app-tasks-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks-modal.html',
  styleUrls: ['./tasks-modal.css']
})
export class TasksModal implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  isNewTaskPanelOpen = false;
  isLoading = true;
  isSaving = false;
  actionInProgressId: number | null = null;

  errorMessage = '';
  successMessage = '';

  activeConfigId: number | null = null;
  scheduledTasks: BackupScheduleResponse[] = [];

  weekDays: WeekDayOption[] = [
    { label: 'L', value: 'MONDAY' },
    { label: 'M', value: 'TUESDAY' },
    { label: 'X', value: 'WEDNESDAY' },
    { label: 'J', value: 'THURSDAY' },
    { label: 'V', value: 'FRIDAY' },
    { label: 'S', value: 'SATURDAY' },
    { label: 'D', value: 'SUNDAY' }
  ];

  taskForm: TaskFormModel = {
    name: '',
    backupType: 'FULL',
    frequency: 'DAILY',
    dayOfWeek: 'MONDAY',
    executionTime: '02:00',
    active: true
  };

  constructor(
    private readonly backupAdminService: BackupAdminService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  close(): void {
    this.closeModal.emit();
  }

  toggleNewTask(): void {
    this.isNewTaskPanelOpen = !this.isNewTaskPanelOpen;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isNewTaskPanelOpen) {
      this.resetForm();
    }
  }

  selectFrequency(frequency: FrequencyType): void {
    this.taskForm.frequency = frequency;

    if (frequency === 'DAILY') {
      this.taskForm.dayOfWeek = 'MONDAY';
    }
  }

  selectDay(dayValue: string): void {
    this.taskForm.dayOfWeek = dayValue;
  }

  saveTask(): void {
    if (this.isSaving) return;

    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'No se pudo identificar al usuario autenticado.';
      return;
    }

    if (!this.activeConfigId) {
      this.errorMessage = 'No existe una configuración de respaldo activa. Configure primero el respaldo.';
      return;
    }

    if (!this.isValidForm()) {
      return;
    }

    this.isSaving = true;

    const payload: BackupScheduleRequest = {
      backupConfigId: this.activeConfigId,
      userId,
      name: this.taskForm.name.trim(),
      backupType: this.taskForm.backupType,
      frequency: this.taskForm.frequency,
      dayOfWeek: this.taskForm.frequency === 'WEEKLY' ? this.taskForm.dayOfWeek : null,
      executionTime: this.normalizeTimeForRequest(this.taskForm.executionTime),
      active: this.taskForm.active
    };

    this.backupAdminService.createSchedule(payload).subscribe({
      next: (createdTask: BackupScheduleResponse) => {
        this.backupAdminService.syncSchedule(createdTask.id).subscribe({
          next: () => {
            this.isSaving = false;
            this.successMessage = 'Tarea creada y sincronizada correctamente.';
            this.resetForm();
            this.isNewTaskPanelOpen = false;
            this.loadSchedulesOnly();
          },
          error: (syncError: HttpErrorResponse) => {
            this.isSaving = false;
            this.successMessage = 'Tarea creada correctamente, pero no se pudo sincronizar.';
            this.errorMessage = this.extractErrorMessage(syncError);
            this.resetForm();
            this.isNewTaskPanelOpen = false;
            this.loadSchedulesOnly();
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  runTask(task: BackupScheduleResponse): void {
    this.actionInProgressId = task.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.backupAdminService.runScheduleNow(task.id).subscribe({
      next: (response: BackupMessageResponse) => {
        this.actionInProgressId = null;
        this.successMessage = response.message || 'Tarea ejecutada correctamente.';
      },
      error: (error: HttpErrorResponse) => {
        this.actionInProgressId = null;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  syncTask(task: BackupScheduleResponse): void {
    this.actionInProgressId = task.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.backupAdminService.syncSchedule(task.id).subscribe({
      next: () => {
        this.actionInProgressId = null;
        this.successMessage = 'Tarea sincronizada correctamente.';
        this.loadSchedulesOnly();
      },
      error: (error: HttpErrorResponse) => {
        this.actionInProgressId = null;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  toggleTaskStatus(task: BackupScheduleResponse): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'No se pudo identificar al usuario autenticado.';
      return;
    }

    this.actionInProgressId = task.id;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: BackupScheduleRequest = {
      backupConfigId: task.backupConfigId,
      userId,
      name: task.name,
      backupType: task.backupType as BackupType,
      frequency: task.frequency as FrequencyType,
      dayOfWeek: task.frequency === 'WEEKLY' ? task.dayOfWeek : null,
      executionTime: this.normalizeTimeForRequest(task.executionTime),
      active: !task.active
    };

    this.backupAdminService.updateSchedule(task.id, payload).subscribe({
      next: () => {
        this.actionInProgressId = null;
        this.successMessage = 'Estado de la tarea actualizado correctamente.';
        this.loadSchedulesOnly();
      },
      error: (error: HttpErrorResponse) => {
        this.actionInProgressId = null;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  deleteTask(task: BackupScheduleResponse): void {
    const confirmed = window.confirm(`¿Desea eliminar la tarea "${task.name}"?`);
    if (!confirmed) return;

    this.actionInProgressId = task.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.backupAdminService.deleteSchedule(task.id).subscribe({
      next: (response: BackupMessageResponse) => {
        this.actionInProgressId = null;
        this.successMessage = response.message || 'Tarea eliminada correctamente.';
        this.loadSchedulesOnly();
      },
      error: (error: HttpErrorResponse) => {
        this.actionInProgressId = null;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  getFrequencyLabel(frequency: string): string {
    return frequency === 'DAILY' ? 'Diaria' : 'Semanal';
  }

  getScheduleLabel(task: BackupScheduleResponse): string {
    const time = this.formatTime(task.executionTime);

    if (task.frequency === 'DAILY') {
      return `Todos los días / ${time}`;
    }

    return `${this.getDayLabel(task.dayOfWeek)} / ${time}`;
  }

  getStatusLabel(task: BackupScheduleResponse): string {
    return task.active ? 'Activo' : 'Inactivo';
  }

  trackByTask(_: number, task: BackupScheduleResponse): number {
    return task.id;
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    forkJoin({
      config: this.backupAdminService.getActiveConfig().pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }
          return throwError(() => error);
        })
      ),
      schedules: this.backupAdminService.getSchedules()
    }).subscribe({
      next: ({ config, schedules }: { config: BackupConfigResponse | null; schedules: BackupScheduleResponse[] }) => {
        this.activeConfigId = config?.id ?? null;
        this.scheduledTasks = schedules;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private loadSchedulesOnly(): void {
    this.backupAdminService.getSchedules().subscribe({
      next: (schedules: BackupScheduleResponse[]) => {
        this.scheduledTasks = schedules;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractErrorMessage(error);
      }
    });
  }

  private resetForm(): void {
    this.taskForm = {
      name: '',
      backupType: 'FULL',
      frequency: 'DAILY',
      dayOfWeek: 'MONDAY',
      executionTime: '02:00',
      active: true
    };
  }

  private isValidForm(): boolean {
    if (!this.taskForm.name.trim()) {
      this.errorMessage = 'El nombre de la tarea es obligatorio.';
      return false;
    }

    if (!this.taskForm.executionTime.trim()) {
      this.errorMessage = 'La hora de ejecución es obligatoria.';
      return false;
    }

    if (this.taskForm.frequency === 'WEEKLY' && !this.taskForm.dayOfWeek) {
      this.errorMessage = 'Debe seleccionar un día para la frecuencia semanal.';
      return false;
    }

    return true;
  }

  private normalizeTimeForRequest(value: string): string {
    const parts = value.split(':');
    const hour = (parts[0] ?? '00').padStart(2, '0');
    const minute = (parts[1] ?? '00').padStart(2, '0');
    return `${hour}:${minute}`;
  }

  private formatTime(value: string): string {
    const parts = value.split(':');
    const hour = parts[0] ?? '00';
    const minute = parts[1] ?? '00';
    return `${hour}:${minute}`;
  }

  private getDayLabel(dayOfWeek?: string | null): string {
    const labels: Record<string, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo'
    };

    if (!dayOfWeek) return '--';
    return labels[dayOfWeek] ?? dayOfWeek;
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

    return error.message || 'No se pudo completar la operación.';
  }
}