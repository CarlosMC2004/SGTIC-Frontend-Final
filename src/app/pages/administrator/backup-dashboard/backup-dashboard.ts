// src/app/pages/admin/backup-dashboard/backup-dashboard.ts
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Subject,
  fromEvent,
  interval,
  merge,
  timeout,
  finalize,
  filter,
  takeUntil
} from 'rxjs';

import { DriveModal } from '../../../components/drive-modal/drive-modal';
import { ConfigModal } from '../../../components/config-modal/config-modal';
import { HistoryModal } from '../../../components/history-modal/history-modal';
import { TasksModal } from '../../../components/tasks-modal/tasks-modal';

import {
  BackupAdminService,
  BackupDashboardViewModel,
  BackupMessageResponse,
  RecentActivityItem
} from '../../../services/backup-dashboard/backup-dashboard';

@Component({
  selector: 'app-backup-dashboard',
  standalone: true,
  imports: [CommonModule, ConfigModal, TasksModal, HistoryModal, DriveModal],
  templateUrl: './backup-dashboard.html',
  styleUrls: ['./backup-dashboard.css']
})
export class BackupDashboard implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly AUTO_REFRESH_MS = 15000;
  private isFetchingDashboard = false;

  showConfigModal = false;
  showTasksModal = false;
  showDriveModal = false;
  showHistoryModal = false;

  isLoading = true;
  isRunningBackup = false;
  errorMessage = '';

  dashboard: BackupDashboardViewModel = {
    systemStatusText: '--',
    systemStatusClass: 'status-inactive',
    lastBackupDate: '--',
    lastBackupTime: '--',
    nextExecutionValue: '--',
    nextExecutionSubtext: '--',
    activeTasks: 0,
    retentionText: '--',
    retentionSubtext: '--',
    recentActivity: [],
    nodeTitle: 'Servidor local',
    nodeStatus: 'Offline',
    nodeProgress: 0
  };

  constructor(
    private readonly backupAdminService: BackupAdminService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.listenRouteChanges();
    this.startAutoRefresh();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadDashboard(false, true);
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get recentActivity(): RecentActivityItem[] {
    return this.dashboard.recentActivity;
  }

  loadDashboard(silent = false, force = false): void {
    if (this.isFetchingDashboard && !force) {
      return;
    }

    this.isFetchingDashboard = true;

    if (!silent) {
      this.isLoading = true;
    }

    this.errorMessage = '';

    this.backupAdminService
      .getDashboardData()
      .pipe(
        timeout(12000),
        finalize(() => {
          this.isFetchingDashboard = false;
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: BackupDashboardViewModel) => {
          this.dashboard = data;
        },
        error: (error: unknown) => {
          console.error('Error cargando dashboard de respaldos', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
  }

  executeBackupNow(): void {
    if (this.isRunningBackup) {
      return;
    }

    this.isRunningBackup = true;
    this.errorMessage = '';

    this.backupAdminService
      .runBackupNow()
      .pipe(
        finalize(() => {
          this.isRunningBackup = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: BackupMessageResponse) => {
          alert(response?.message || 'Respaldo ejecutado correctamente.');

          this.loadDashboard(true, true);

          setTimeout(() => {
            if (this.canAutoRefresh()) {
              this.loadDashboard(true, true);
            }
          }, 4000);
        },
        error: (error: unknown) => {
          console.error('Error ejecutando respaldo manual', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
  }

  openConfig(): void {
    this.showConfigModal = true;
  }

  closeConfig(): void {
    this.showConfigModal = false;
    this.loadDashboard(true, true);
  }

  openTasks(): void {
    this.showTasksModal = true;
  }

  closeTasks(): void {
    this.showTasksModal = false;
    this.loadDashboard(true, true);
  }

  openDrive(): void {
    this.showDriveModal = true;
  }

  closeDrive(): void {
    this.showDriveModal = false;
    this.loadDashboard(true, true);
  }

  openHistory(): void {
    this.showHistoryModal = true;
  }

  closeHistory(): void {
    this.showHistoryModal = false;
    this.loadDashboard(true, true);
  }

  trackByRecentActivity(_: number, item: RecentActivityItem): string {
    return item.id;
  }

  private listenRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes('/admin/backups')) {
          setTimeout(() => {
            this.loadDashboard(true, true);
          }, 50);
        }
      });
  }

  private startAutoRefresh(): void {
    const periodicRefresh$ = interval(this.AUTO_REFRESH_MS);

    const focusRefresh$ = fromEvent(window, 'focus');

    const visibilityRefresh$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => document.visibilityState === 'visible')
    );

    merge(periodicRefresh$, focusRefresh$, visibilityRefresh$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.canAutoRefresh()) {
          this.loadDashboard(true, false);
        }
      });
  }

  private canAutoRefresh(): boolean {
    return !this.isRunningBackup && !this.hasOpenModal();
  }

  private hasOpenModal(): boolean {
    return (
      this.showConfigModal ||
      this.showTasksModal ||
      this.showDriveModal ||
      this.showHistoryModal
    );
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error as
        | { message?: string; error?: string }
        | string
        | null
        | undefined;

      if (typeof backendError === 'string' && backendError.trim()) {
        return backendError;
      }

      if (backendError && typeof backendError === 'object') {
        if (backendError.message) return backendError.message;
        if (backendError.error) return backendError.error;
      }

      if (error.message) {
        return error.message;
      }

      return 'No se pudo completar la operación.';
    }

    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return 'La carga del dashboard tardó demasiado. Revise la conexión o el backend.';
      }

      return error.message;
    }

    return 'No se pudo completar la operación.';
  }
}