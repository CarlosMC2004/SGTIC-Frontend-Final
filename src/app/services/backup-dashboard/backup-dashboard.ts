// src/app/services/backup-admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  forkJoin,
  map,
  switchMap,
  throwError
} from 'rxjs';

export interface BackupMessageResponse {
  message: string;
}

export interface BackupConfigRequest {
  userId: number;
  active: boolean;
  pgDumpPath?: string | null;
  localPath: string;
  filePrefix: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  pgpassFilePath?: string | null;
  cleanupEnabled: boolean;
  retentionDays: number;
  driveEnabled: boolean;
  driveAccountId?: number | null;
  driveFolderId?: string | null;
}

export interface BackupConfigResponse {
  id: number;
  createdBy: number;
  updatedBy?: number | null;
  active: boolean;
  pgDumpPath?: string | null;
  localPath: string;
  filePrefix: string;
  databaseHost: string;
  databasePort: number;
  databaseName: string;
  databaseUser: string;
  pgpassFilePath?: string | null;
  cleanupEnabled: boolean;
  retentionDays: number;
  driveEnabled: boolean;
  driveAccountId?: number | null;
  driveFolderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupExecutionResponse {
  id: number;
  backupConfigId: number;
  idUsuario?: number | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  backupType: string;
  triggeredBy: string;
  startedAt: string;
  finishedAt?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  fileSizeBytes?: number | null;
  exitCode?: number | null;
  message?: string | null;
  fileDeleted?: boolean;
  deletedAt?: string | null;
  deletionReason?: string | null;
  cleanupMessage?: string | null;
  driveUploaded?: boolean;
  driveFileId?: string | null;
  driveFileName?: string | null;
  driveWebViewLink?: string | null;
  driveUploadedAt?: string | null;
  driveMessage?: string | null;
}

export interface BackupScheduleRequest {
  backupConfigId: number;
  userId: number;
  name: string;
  backupType: 'FULL' | 'DIFFERENTIAL' | 'INCREMENTAL';
  frequency: 'DAILY' | 'WEEKLY';
  dayOfWeek?: string | null;
  executionTime: string; // HH:mm
  active: boolean;
}

export interface BackupScheduleResponse {
  id: number;
  backupConfigId: number;
  createdBy: number;
  updatedBy?: number | null;
  name: string;
  backupType: string;
  frequency: 'DAILY' | 'WEEKLY';
  dayOfWeek?: string | null;
  executionTime: string;
  active: boolean;
  windowsTaskName?: string | null;
  lastSyncMessage?: string | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriveAuthUrlResponse {
  authorizationUrl: string;
}

export interface DriveAccountResponse {
  id: number;
  googleEmail?: string | null;
  googleSub?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecentActivityItem {
  id: string;
  time: string;
  origin: string;
  size: string;
  status: 'COMPLETADO' | 'FALLIDO' | 'EN EJECUCIÓN';
  fileName: string; // <-- AÑADIDO PARA SABER QUÉ ARCHIVO RESTAURAR
}

export interface BackupDashboardViewModel {
  systemStatusText: string;
  systemStatusClass: 'status-active' | 'status-inactive';
  lastBackupDate: string;
  lastBackupTime: string;
  nextExecutionValue: string;
  nextExecutionSubtext: string;
  activeTasks: number;
  retentionText: string;
  retentionSubtext: string;
  recentActivity: RecentActivityItem[];
  nodeTitle: string;
  nodeStatus: string;
  nodeProgress: number;
}

@Injectable({
  providedIn: 'root'
})
export class BackupAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:8080';

  private readonly backupBaseUrl = `${this.apiBase}/api/admin/backups`;
  private readonly scheduleBaseUrl = `${this.apiBase}/api/admin/backup-schedules`;
  private readonly driveBaseUrl = `${this.apiBase}/api/admin/drive`;

  getActiveConfig(): Observable<BackupConfigResponse> {
    return this.http.get<BackupConfigResponse>(`${this.backupBaseUrl}/config/active`);
  }

  createConfig(request: BackupConfigRequest): Observable<BackupConfigResponse> {
    return this.http.post<BackupConfigResponse>(`${this.backupBaseUrl}/config`, request);
  }

  updateConfig(id: number, request: BackupConfigRequest): Observable<BackupConfigResponse> {
    return this.http.put<BackupConfigResponse>(`${this.backupBaseUrl}/config/${id}`, request);
  }

  getExecutionHistory(): Observable<BackupExecutionResponse[]> {
    return this.http.get<BackupExecutionResponse[]>(`${this.backupBaseUrl}/executions`);
  }

  runManualBackup(type: string, adminId: number): Observable<BackupMessageResponse> {
    return this.http.post<BackupMessageResponse>(`${this.backupBaseUrl}/run`, null, {
      params: { type, adminId: adminId.toString() }
    });
  }

  restoreDatabase(executionId: number, adminId: number): Observable<BackupMessageResponse> {
    return this.http.post<BackupMessageResponse>(`${this.backupBaseUrl}/executions/${executionId}/restore`, null, {
      params: { adminId: adminId.toString() }
    });
  }

  // --- NUEVO: ENDPOINT DE EMERGENCIA PARA RESTAURAR ---
  emergencyRestore(fileName: string): Observable<BackupMessageResponse> {
    return this.http.post<BackupMessageResponse>(`${this.apiBase}/api/backup/emergency-restore`, null, {
      params: { fileName }
    });
  }
  // ----------------------------------------------------

  getSchedules(): Observable<BackupScheduleResponse[]> {
    return this.http.get<BackupScheduleResponse[]>(this.scheduleBaseUrl);
  }

  getScheduleById(id: number): Observable<BackupScheduleResponse> {
    return this.http.get<BackupScheduleResponse>(`${this.scheduleBaseUrl}/${id}`);
  }

  createSchedule(request: BackupScheduleRequest): Observable<BackupScheduleResponse> {
    return this.http.post<BackupScheduleResponse>(this.scheduleBaseUrl, request);
  }

  updateSchedule(id: number, request: BackupScheduleRequest): Observable<BackupScheduleResponse> {
    return this.http.put<BackupScheduleResponse>(`${this.scheduleBaseUrl}/${id}`, request);
  }

  syncSchedule(id: number): Observable<BackupScheduleResponse> {
    return this.http.post<BackupScheduleResponse>(`${this.scheduleBaseUrl}/${id}/sync`, {});
  }

  runScheduleNow(id: number): Observable<BackupMessageResponse> {
    return this.http.post<BackupMessageResponse>(`${this.scheduleBaseUrl}/${id}/run`, {});
  }

  deleteSchedule(id: number): Observable<BackupMessageResponse> {
    return this.http.delete<BackupMessageResponse>(`${this.scheduleBaseUrl}/${id}`);
  }

  getDriveAuthUrl(userId: number): Observable<DriveAuthUrlResponse> {
    return this.http.get<DriveAuthUrlResponse>(`${this.driveBaseUrl}/oauth/url`, {
      params: { userId }
    });
  }

  getActiveDriveAccount(): Observable<DriveAccountResponse> {
    return this.http.get<DriveAccountResponse>(`${this.driveBaseUrl}/account/active`);
  }

  unlinkDriveAccount(accountId: number, userId: number): Observable<BackupMessageResponse> {
    return this.http.delete<BackupMessageResponse>(`${this.driveBaseUrl}/account/${accountId}`, {
      params: { userId }
    });
  }

  getDashboardData(): Observable<BackupDashboardViewModel> {
    return forkJoin({
      config: this.getActiveConfig(),
      executions: this.getExecutionHistory(),
      schedules: this.getSchedules()
    }).pipe(
      map(({ config, executions, schedules }) => {
        const sortedExecutions = [...executions].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        const lastSuccess = sortedExecutions.find(e => e.status === 'SUCCESS') ?? null;
        const nextRun = this.calculateNextRun(schedules.filter(s => s.active));

        return {
          systemStatusText: config.active ? 'Activo' : 'Inactivo',
          systemStatusClass: config.active ? 'status-active' : 'status-inactive',
          lastBackupDate: lastSuccess ? this.formatDate(lastSuccess.finishedAt || lastSuccess.startedAt) : '--',
          lastBackupTime: lastSuccess ? this.formatTime(lastSuccess.finishedAt || lastSuccess.startedAt) : 'Sin registros',
          nextExecutionValue: nextRun ? this.formatDate(nextRun.toISOString()) : 'Sin tarea',
          nextExecutionSubtext: nextRun ? this.formatTime(nextRun.toISOString()) : 'No programada',
          activeTasks: schedules.filter(s => s.active).length,
          retentionText: `${config.retentionDays} día${config.retentionDays === 1 ? '' : 's'}`,
          retentionSubtext: config.cleanupEnabled ? 'Limpieza automática activa' : 'Limpieza desactivada',
          recentActivity: sortedExecutions.slice(0, 5).map(e => ({
            id: `BK-${e.id}`,
            time: this.timeAgo(e.startedAt),
            origin: `${e.backupType} / ${e.triggeredBy}`,
            size: this.formatBytes(e.fileSizeBytes),
            status: this.mapStatus(e.status),
            fileName: e.fileName || '' // <-- AÑADIDO PARA LA RESTAURACIÓN
          })),
          nodeTitle: config.localPath || 'Servidor local',
          nodeStatus: config.active ? 'Online' : 'Offline',
          nodeProgress: config.active ? 80 : 0
        };
      })
    );
  }

  private mapStatus(status: BackupExecutionResponse['status']): 'COMPLETADO' | 'FALLIDO' | 'EN EJECUCIÓN' {
    switch (status) {
      case 'SUCCESS': return 'COMPLETADO';
      case 'FAILED': return 'FALLIDO';
      default: return 'EN EJECUCIÓN';
    }
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return '--';
    return new Intl.DateTimeFormat('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  }

  private formatTime(value: string | null | undefined): string {
    if (!value) return '--';
    return new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
  }

  private formatBytes(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return '--';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) { value /= 1024; unitIndex++; }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }

  private timeAgo(value: string): string {
    const diffMs = new Date().getTime() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (minutes < 1) return 'Hace unos segundos';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  }

  private calculateNextRun(activeSchedules: BackupScheduleResponse[]): Date | null {
    if (!activeSchedules.length) return null;
    const now = new Date();
    const candidates = activeSchedules.map(schedule => this.getNextExecutionDate(schedule, now)).filter((date): date is Date => date !== null).sort((a, b) => a.getTime() - b.getTime());
    return candidates[0] ?? null;
  }

  private getNextExecutionDate(schedule: BackupScheduleResponse, from: Date): Date | null {
    const [hourStr, minuteStr, secondStr] = schedule.executionTime.split(':');
    const hour = Number(hourStr ?? 0);
    const minute = Number(minuteStr ?? 0);
    const second = Number(secondStr ?? 0);
    if (schedule.frequency === 'DAILY') {
      const next = new Date(from);
      next.setHours(hour, minute, second, 0);
      if (next <= from) next.setDate(next.getDate() + 1);
      return next;
    }
    if (schedule.frequency === 'WEEKLY') {
      const targetDay = this.mapDayOfWeek(schedule.dayOfWeek);
      if (targetDay === null) return null;
      const next = new Date(from);
      next.setHours(hour, minute, second, 0);
      const currentDay = next.getDay();
      let diff = targetDay - currentDay;
      if (diff < 0 || (diff === 0 && next <= from)) diff += 7;
      next.setDate(next.getDate() + diff);
      return next;
    }
    return null;
  }

  private mapDayOfWeek(day?: string | null): number | null {
    if (!day) return null;
    const map: Record<string, number> = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };
    return map[day] ?? null;
  }

  syncDatabase(adminId: number): Observable<BackupMessageResponse> {
    return this.http.post<BackupMessageResponse>(`${this.backupBaseUrl}/sync`, null, {
      params: { adminId: adminId.toString() }
    });
  }
}