// src/app/pages/admin/backup-dashboard/backup-dashboard.ts
import { AfterViewInit, Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, fromEvent, interval, merge, timeout, finalize, filter, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { DriveModal } from '../../../components/drive-modal/drive-modal';
import { ConfigModal } from '../../../components/config-modal/config-modal';
import { HistoryModal } from '../../../components/history-modal/history-modal';
import { TasksModal } from '../../../components/tasks-modal/tasks-modal';
import { AuthService } from '../../../services/auth.service';

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
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef // <-- INYECTADO AQUÍ
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
    if (this.isFetchingDashboard && !force) return;
    this.isFetchingDashboard = true;
    if (!silent) this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // Forzar actualización visual del loader

    this.backupAdminService
      .getDashboardData()
      .pipe(
        timeout(12000),
        finalize(() => { 
          this.isFetchingDashboard = false; 
          this.isLoading = false; 
          this.cdr.detectChanges(); // Forzar al terminar
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: BackupDashboardViewModel) => { 
          this.dashboard = data; 
          this.cdr.detectChanges(); // <-- LA MAGIA
        },
        error: (error: unknown) => {
          console.error('Error cargando dashboard', error);
          this.errorMessage = this.extractErrorMessage(error);
          this.cdr.detectChanges(); // <-- LA MAGIA
        }
      });
  }

  executeBackupNow(): void {
    if (this.isRunningBackup) return;

    Swal.fire({
      title: 'Ejecutar Respaldo Manual',
      text: 'Seleccione el tipo de respaldo que desea lanzar:',
      input: 'select',
      inputOptions: {
        'FULL': 'FULL (Completo)',
        'DIFFERENTIAL': 'DIFERENCIAL',
        'INCREMENTAL': 'INCREMENTAL'
      },
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Iniciar Respaldo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.runManualBackupAPI(result.value);
      }
    });
  }

  private runManualBackupAPI(type: string): void {
    const adminId = this.authService.getUserId() || 3;
    this.isRunningBackup = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    Swal.fire({
      title: 'Ejecutando Respaldo...',
      text: `Por favor espere, procesando backup ${type}.`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.backupAdminService
      .runManualBackup(type, adminId)
      .pipe(
        finalize(() => { 
          this.isRunningBackup = false; 
          this.cdr.detectChanges(); 
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: BackupMessageResponse) => {
          Swal.fire('¡Éxito!', response.message || 'Respaldo ejecutado correctamente.', 'success');
          this.loadDashboard(true, true);
        },
        error: (error: unknown) => {
          console.error('Error ejecutando respaldo manual', error);
          Swal.fire('Error', this.extractErrorMessage(error), 'error');
          this.loadDashboard(true, true);
        }
      });
  }

  openConfig(): void { this.showConfigModal = true; this.cdr.detectChanges(); }
  closeConfig(): void { this.showConfigModal = false; this.loadDashboard(true, true); }
  openTasks(): void { this.showTasksModal = true; this.cdr.detectChanges(); }
  closeTasks(): void { this.showTasksModal = false; this.loadDashboard(true, true); }
  openDrive(): void { this.showDriveModal = true; this.cdr.detectChanges(); }
  closeDrive(): void { this.showDriveModal = false; this.loadDashboard(true, true); }
  openHistory(): void { this.showHistoryModal = true; this.cdr.detectChanges(); }
  closeHistory(): void { this.showHistoryModal = false; this.loadDashboard(true, true); }

  trackByRecentActivity(_: number, item: RecentActivityItem): string { return item.id; }

  private listenRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes('/admin/backups')) {
          setTimeout(() => { this.loadDashboard(true, true); }, 50);
        }
      });
  }

  private startAutoRefresh(): void {
    const periodicRefresh$ = interval(this.AUTO_REFRESH_MS);
    const focusRefresh$ = fromEvent(window, 'focus');
    const visibilityRefresh$ = fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible'));

    merge(periodicRefresh$, focusRefresh$, visibilityRefresh$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => { if (this.canAutoRefresh()) this.loadDashboard(true, false); });
  }

  private canAutoRefresh(): boolean { return !this.isRunningBackup && !this.hasOpenModal(); }
  private hasOpenModal(): boolean { return (this.showConfigModal || this.showTasksModal || this.showDriveModal || this.showHistoryModal); }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error as { message?: string; error?: string } | string | null | undefined;
      if (typeof backendError === 'string' && backendError.trim()) return backendError;
      if (backendError && typeof backendError === 'object') {
        if (backendError.message) return backendError.message;
        if (backendError.error) return backendError.error;
      }
      if (error.message) return error.message;
      return 'No se pudo completar la operación.';
    }
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') return 'La carga del dashboard tardó demasiado. Revise la conexión o el backend.';
      return error.message;
    }
    return 'No se pudo completar la operación.';
  }
}