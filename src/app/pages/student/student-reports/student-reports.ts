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

  // Inicialización base del gráfico
  private initChart(): void {
    const ctx = document.getElementById('studentActivityChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.activityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e2e8f0'],
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: true, position: 'right' } 
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
            this.selectedReport = this.catalog[0];
            this.selectedReportType = this.catalog[0].type;
            
            // CORRECCIÓN: Solo cargar si ya tenemos el periodo del Topbar
            if (this.selectedPeriodId) {
              this.loadSelectedReportPreview();
            }
          }
        },
        error: (err) => this.errorMessage = 'No se pudo cargar el catálogo.'
      });
  }

  onPeriodoChange(periodo: any): void {
    if (!periodo) return;

    const currentId = (typeof periodo === 'number' || typeof periodo === 'string') 
                      ? Number(periodo) 
                      : (periodo.idPeriodo || periodo.id || periodo.id_periodo);

    if (currentId) {
        this.selectedPeriodId = currentId;
        this.selectedPeriodLabel = typeof periodo === 'object' && periodo.nombre 
                                   ? periodo.nombre 
                                   : `Periodo ${currentId}`;
        
        // ¡Ahora sí llamamos al backend!
        if (this.selectedReport) {
            this.loadSelectedReportPreview();
        }
    }
    this.cdr.detectChanges();
  }

  selectReport(item: ReportCatalogItemDTO): void {
    if (this.selectedReport?.type === item.type) return; 
    this.selectedReport = item;
    this.selectedReportType = item.type;
    
    // CORRECCIÓN: Validar que haya periodo antes de cargar
    if (this.selectedPeriodId) {
      this.loadSelectedReportPreview();
    }
  }

  private loadSelectedReportPreview(): void {
    if (!this.selectedReport || !this.selectedPeriodId) return;
    
    this.isLoadingPreview = true;
    
    // CORRECCIÓN: Agregando el ID del periodo a la URL
    const endpointWithParams = `${this.selectedReport.dataEndpoint}?periodoId=${this.selectedPeriodId}`;

    this.studentReportsService.getReportData(endpointWithParams)
      .pipe(finalize(() => { this.isLoadingPreview = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.buildPreview(data),
        error: () => {
          this.previewMode = 'empty';
          this.clearChart();
        }
      });
  }

  private buildPreview(data: any): void {
    this.previewColumns = [];
    this.previewRows = [];
    
    if (Array.isArray(data) && data.length > 0) {
      this.previewMode = 'array';
      const keys = Object.keys(data[0]);
      this.previewColumns = keys.map(k => ({ 
        key: k, 
        label: k.replace(/([A-Z])/g, ' $1').toUpperCase().trim() 
      }));
      this.previewRows = data;
      
      this.updateChartWithRealData(data);
    } else {
      this.previewMode = 'empty';
      this.clearChart();
    }
  }

  private updateChartWithRealData(data: any[]): void {
    if (!this.activityChart) return;

    const agruparPor = Object.keys(data[0]).find(k => 
      k.toLowerCase().includes('estado') || 
      k.toLowerCase().includes('tipo') || 
      k.toLowerCase().includes('modalidad') ||
      k.toLowerCase().includes('rol')
    );

    if (!agruparPor) {
      this.clearChart();
      return;
    }

    const conteo: Record<string, number> = {};
    data.forEach(row => {
      const valor = row[agruparPor] ? String(row[agruparPor]).toUpperCase() : 'NO DEFINIDO';
      conteo[valor] = (conteo[valor] || 0) + 1;
    });

    this.activityChart.data.labels = Object.keys(conteo);
    this.activityChart.data.datasets[0] = {
      label: 'Total',
      data: Object.values(conteo),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
      borderColor: 'transparent',
      fill: true,
      tension: 0.4
    };
    
    this.activityChart.update();
  }

  private clearChart(): void {
    if (this.activityChart) {
      this.activityChart.data.labels = ['Sin datos agrupables'];
      this.activityChart.data.datasets[0].data = [1];
      this.activityChart.data.datasets[0].backgroundColor = ['#e2e8f0'];
      this.activityChart.update();
    }
  }

  isStatusColumn(value: string | null | undefined): boolean {
    if (!value) return false;
    const v = String(value).toLowerCase().trim();
    return ['aprobada', 'aprobado', 'pendiente', 'rechazada', 'rechazado', 'en curso', 'en_curso', 'inactivo', 'activo'].includes(v);
  }

  getStatusClass(value: string | null | undefined): string {
    if (!value) return 'badge badge-default';
    const v = String(value).toLowerCase().trim();
    if (v.includes('aprobad') || v === 'activo') return 'badge badge-success';
    if (v.includes('pendient') || v.includes('curso')) return 'badge badge-warning';
    if (v.includes('rechazad') || v.includes('inactivo')) return 'badge badge-danger';
    return 'badge badge-default';
  }

  exportToCsv(): void {
    if (!this.previewRows || this.previewRows.length === 0) return;

    const fechaActual = new Intl.DateTimeFormat('es-EC', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(new Date());
    
    const nombreReporte = this.selectedReport?.title || 'Reporte Académico';
    const periodoInfo = this.selectedPeriodLabel;

    // 2. Construir los Metadatos Institucionales (Encabezado del Excel)
    let csvContent = '\ufeff';
    csvContent += `Universidad Técnica Estatal de Quevedo\n`;
    csvContent += `Sistema de Gestión de Titulación (SGTIC)\n\n`;
    csvContent += `Documento:,"${nombreReporte}"\n`;
    csvContent += `Período:,"${periodoInfo}"\n`;
    csvContent += `Generado el:,"${fechaActual}"\n\n`;

    // 3. Generar las cabeceras de la tabla
    const headers = this.previewColumns.map(c => `"${c.label}"`).join(',');
    csvContent += `${headers}\n`;
    
    // 4. Generar las filas de datos
    const rows = this.previewRows.map(row => {
      return this.previewColumns.map(col => {
        let cell = row[col.key] === null || row[col.key] === undefined ? '' : String(row[col.key]);
        // Escapar comillas dobles para CSV
        cell = cell.replace(/"/g, '""'); 
        return `"${cell}"`;
      }).join(',');
    }).join('\n');

    csvContent += rows;

    // 5. Descargar el archivo con un nombre mucho más profesional
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    const cleanName = nombreReporte.replace(/\s+/g, '_');
    const timestamp = new Date().getTime();
    link.download = `SGTIC_${cleanName}_${timestamp}.csv`;
    
    link.click();
    URL.revokeObjectURL(link.href);
  }

  downloadPdf(item: ReportCatalogItemDTO, event: Event): void {
    event.stopPropagation();
    if (!this.selectedPeriodId) return;

    this.isDownloadingPdf = true;
    
    // CORRECCIÓN: Agregando el ID del periodo a la URL de descarga del PDF
    const pdfEndpointWithParams = `${item.pdfEndpoint}?periodoId=${this.selectedPeriodId}`;

    this.studentReportsService.downloadReportPdf(pdfEndpointWithParams)
      .pipe(finalize(() => { this.isDownloadingPdf = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          if (!res.body) return;
          const url = window.URL.createObjectURL(res.body);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${item.title.replace(/\s+/g, '_')}_${this.selectedPeriodLabel}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      });
  }
}