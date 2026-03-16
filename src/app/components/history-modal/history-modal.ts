import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BackupAdminService,
  BackupExecutionResponse
} from '../../services/backup-dashboard/backup-dashboard';

type StatusFilter = 'ALL' | 'SUCCESS' | 'FAILED' | 'RUNNING';

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-modal.html',
  styleUrls: ['./history-modal.css']
})
export class HistoryModal implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  isLoading = true;
  errorMessage = '';

  executions: BackupExecutionResponse[] = [];
  selectedExecution: BackupExecutionResponse | null = null;

  searchTerm = '';
  statusFilter: StatusFilter = 'ALL';
  typeFilter = 'ALL';
  dateFrom = '';
  dateTo = '';

  readonly typeOptions = ['ALL', 'FULL', 'DIFFERENTIAL', 'INCREMENTAL'];

  constructor(private readonly backupAdminService: BackupAdminService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  close(): void {
    this.closeModal.emit();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.backupAdminService.getExecutionHistory().subscribe({
      next: (data: BackupExecutionResponse[]) => {
        this.executions = [...data].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        this.selectedExecution = this.executions.length ? this.executions[0] : null;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  selectExecution(item: BackupExecutionResponse): void {
    this.selectedExecution = item;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.dateFrom = '';
    this.dateTo = '';
  }

  get filteredExecutions(): BackupExecutionResponse[] {
    return this.executions.filter((item) => {
      const matchesSearch = this.matchesSearch(item);
      const matchesStatus =
        this.statusFilter === 'ALL' || item.status === this.statusFilter;
      const matchesType =
        this.typeFilter === 'ALL' || item.backupType === this.typeFilter;
      const matchesFrom = this.matchesDateFrom(item.startedAt);
      const matchesTo = this.matchesDateTo(item.startedAt);

      return matchesSearch && matchesStatus && matchesType && matchesFrom && matchesTo;
    });
  }

  getStatusLabel(status: BackupExecutionResponse['status']): string {
    switch (status) {
      case 'SUCCESS':
        return 'Completado';
      case 'FAILED':
        return 'Fallido';
      default:
        return 'En ejecución';
    }
  }

  getStatusClass(status: BackupExecutionResponse['status']): string {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  formatDateTime(value?: string | null): string {
    if (!value) return '--';

    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(value));
  }

  formatBytes(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return '--';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }

  getDuration(startedAt?: string | null, finishedAt?: string | null): string {
    if (!startedAt || !finishedAt) return '--';

    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '--';

    const diffMs = end - start;
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }

  openDriveLink(link?: string | null): void {
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  copyText(value?: string | null): void {
    if (!value) return;
    navigator.clipboard.writeText(value).catch(() => {});
  }

  trackByExecution(_: number, item: BackupExecutionResponse): number {
    return item.id;
  }

  private matchesSearch(item: BackupExecutionResponse): boolean {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return true;

    const haystack = [
      item.fileName,
      item.filePath,
      item.message,
      item.backupType,
      item.triggeredBy,
      item.driveFileName,
      item.driveMessage
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  }

  private matchesDateFrom(startedAt: string): boolean {
    if (!this.dateFrom) return true;

    const start = new Date(startedAt);
    const from = new Date(`${this.dateFrom}T00:00:00`);

    return start.getTime() >= from.getTime();
  }

  private matchesDateTo(startedAt: string): boolean {
    if (!this.dateTo) return true;

    const start = new Date(startedAt);
    const to = new Date(`${this.dateTo}T23:59:59`);

    return start.getTime() <= to.getTime();
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

    return error.message || 'No se pudo cargar el historial.';
  }
}