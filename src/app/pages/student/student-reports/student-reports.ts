import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subject, finalize, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';

import {
  ReportCatalogItemDTO,
  StudentReportType,
  StudentReportsService
} from '../../../services/student-reports/student-reports';

Chart.register(...registerables);

interface PreviewField { key: string; label: string; value: string; }
interface PreviewColumn { key: string; label: string; }
type PreviewMode = 'empty' | 'object' | 'array';

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, Topbar],
  templateUrl: './student-reports.html',
  styleUrls: ['./student-reports.css']
})
export class StudentReports implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private activityChart: Chart | null = null;

  isLoadingCatalog = true;
  isLoadingPreview = false;
  isDownloadingPdf = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  selectedReportType: StudentReportType | '' = '';
  selectedPeriodLabel = 'Cargando...';
  selectedPeriodId: number | null = null;

  catalog: ReportCatalogItemDTO[] = [];
  selectedReport: ReportCatalogItemDTO | null = null;
  previewMode: PreviewMode = 'empty';
  previewColumns: PreviewColumn[] = [];
  previewRows: Record<string, string>[] = [];

  constructor(private readonly studentReportsService: StudentReportsService) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.activityChart) this.activityChart.destroy();
  }

  private initChart(): void {
    const ctx = document.getElementById('studentActivityChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
        datasets: [{
          label: 'Horas de Tutoría',
          data: [2, 4, 3, 7, 5],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  get previewCount(): number {
    return this.previewRows.length;
  }

  loadCatalog(): void {
    this.isLoadingCatalog = true;
    this.studentReportsService.getCatalog()
      .pipe(finalize(() => { this.isLoadingCatalog = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$))
      .subscribe({
        next: (catalog) => {
          this.catalog = catalog || [];
          if (this.catalog.length > 0) {
            this.selectReport(this.catalog[0]);
          }
        },
        error: (err) => this.errorMessage = 'No se pudo cargar el catálogo.'
      });
  }

  onPeriodoChange(periodo: any): void {
    if (periodo?.idPeriodo) {
        this.selectedPeriodId = periodo.idPeriodo;
        this.selectedPeriodLabel = periodo.nombre || `Periodo ${periodo.idPeriodo}`;
        if (this.selectedReport) this.loadSelectedReportPreview();
    }
    this.cdr.detectChanges();
  }

  selectReport(item: ReportCatalogItemDTO): void {
    this.selectedReport = item;
    this.selectedReportType = item.type;
    this.loadSelectedReportPreview();
  }

  private loadSelectedReportPreview(): void {
    if (!this.selectedReport) return;
    this.isLoadingPreview = true;
    this.studentReportsService.getReportData(this.selectedReport.dataEndpoint)
      .pipe(finalize(() => { this.isLoadingPreview = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.buildPreview(data),
        error: () => this.previewMode = 'empty'
      });
  }

  private buildPreview(data: any): void {
    this.previewColumns = [];
    this.previewRows = [];
    if (Array.isArray(data) && data.length > 0) {
      this.previewMode = 'array';
      const keys = Object.keys(data[0]);
      this.previewColumns = keys.map(k => ({ key: k, label: k.replace(/([A-Z])/g, ' $1').toUpperCase() }));
      this.previewRows = data;
    } else {
      this.previewMode = 'empty';
    }
  }

  downloadPdf(item: ReportCatalogItemDTO, event: Event): void {
    event.stopPropagation();
    this.isDownloadingPdf = true;
    this.studentReportsService.downloadReportPdf(item.pdfEndpoint)
      .pipe(finalize(() => { this.isDownloadingPdf = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          const url = window.URL.createObjectURL(res.body!);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${item.title}.pdf`;
          a.click();
        }
      });
  }
}