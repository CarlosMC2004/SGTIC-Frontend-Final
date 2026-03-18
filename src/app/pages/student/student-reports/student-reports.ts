import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subject, finalize, takeUntil } from 'rxjs';

import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';

import {
  ReportCatalogItemDTO,
  StudentReportType,
  StudentReportsService
} from '../../../services/student-reports/student-reports';

interface PreviewField {
  key: string;
  label: string;
  value: string;
}

interface PreviewColumn {
  key: string;
  label: string;
}

type PreviewMode = 'empty' | 'object' | 'array';

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, Topbar],
  templateUrl: './student-reports.html',
  styleUrls: ['./student-reports.css']
})
export class StudentReports implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  isLoadingCatalog = true;
  isLoadingPreview = false;
  isDownloadingPdf = false;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  selectedReportType: StudentReportType | '' = '';
  selectedPeriodLabel = 'Período actual';
  selectedPeriodId: number | null = null;

  catalog: ReportCatalogItemDTO[] = [];
  selectedReport: ReportCatalogItemDTO | null = null;
  previewRawData: unknown = null;

  previewMode: PreviewMode = 'empty';
  previewFields: PreviewField[] = [];
  previewColumns: PreviewColumn[] = [];
  previewRows: Record<string, string>[] = [];

  constructor(
    private readonly studentReportsService: StudentReportsService
  ) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredCatalog(): ReportCatalogItemDTO[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.catalog;
    }

    return this.catalog.filter((item) =>
      `${item.title} ${item.description} ${item.type}`.toLowerCase().includes(term)
    );
  }

  get selectedReportTitle(): string {
    return this.selectedReport?.title || 'Seleccione un reporte';
  }

  get selectedReportDescription(): string {
    return (
      this.selectedReport?.description ||
      'Elija un reporte del catálogo para visualizarlo y descargarlo en PDF.'
    );
  }

  get previewCount(): number {
    if (this.previewMode === 'array') {
      return this.previewRows.length;
    }

    if (this.previewMode === 'object') {
      return this.previewFields.length;
    }

    return 0;
  }

  loadCatalog(): void {
    this.isLoadingCatalog = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.refreshView();

    this.studentReportsService
      .getCatalog()
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingCatalog = false;
            this.refreshView();
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (catalog) => {
          this.ngZone.run(() => {
            this.catalog = catalog || [];

            if (this.catalog.length > 0) {
              const first = this.catalog[0];
              this.selectedReportType = first.type;
              this.selectedReport = first;
              this.loadSelectedReportPreview();
            } else {
              this.selectedReportType = '';
              this.selectedReport = null;
              this.clearPreview();
            }

            this.refreshView();
          });
        },
        error: (error: unknown) => {
          this.ngZone.run(() => {
            console.error('Error cargando catálogo de reportes', error);
            this.errorMessage = this.extractErrorMessage(error);
            this.selectedReportType = '';
            this.selectedReport = null;
            this.clearPreview();
            this.refreshView();
          });
        }
      });
  }

  onPeriodoChange(periodo: unknown): void {
    let periodoId: number | null = null;
    let periodoLabel = 'Período actual';

    if (typeof periodo === 'number' && !Number.isNaN(periodo)) {
      periodoId = periodo;
      periodoLabel = `Período ${periodo}`;
    } else if (typeof periodo === 'string' && periodo.trim()) {
      periodoLabel = periodo.trim();
    } else if (
      periodo &&
      typeof periodo === 'object' &&
      'idPeriod' in periodo &&
      typeof (periodo as { idPeriod?: unknown }).idPeriod === 'number'
    ) {
      periodoId = (periodo as { idPeriod: number }).idPeriod;

      if (
        'nombre' in periodo &&
        typeof (periodo as { nombre?: unknown }).nombre === 'string' &&
        (periodo as { nombre: string }).nombre.trim()
      ) {
        periodoLabel = (periodo as { nombre: string }).nombre.trim();
      } else {
        periodoLabel = `Período ${periodoId}`;
      }
    } else if (
      periodo &&
      typeof periodo === 'object' &&
      'nombre' in periodo &&
      typeof (periodo as { nombre?: unknown }).nombre === 'string'
    ) {
      periodoLabel = (periodo as { nombre: string }).nombre.trim();
    }

    const changed = this.selectedPeriodId !== periodoId || this.selectedPeriodLabel !== periodoLabel;

    this.selectedPeriodId = periodoId;
    this.selectedPeriodLabel = periodoLabel;

    if (!changed) {
      this.refreshView();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (this.selectedReport) {
      this.loadSelectedReportPreview();
    } else if (this.catalog.length > 0) {
      this.selectedReport = this.catalog[0];
      this.selectedReportType = this.catalog[0].type;
      this.loadSelectedReportPreview();
    } else {
      this.loadCatalog();
    }

    this.refreshView();
  }

  onReportSelectionChange(type: StudentReportType | ''): void {
    if (!type) {
      this.selectedReport = null;
      this.clearPreview();
      this.refreshView();
      return;
    }

    const report = this.catalog.find((item) => item.type === type) || null;
    this.selectedReport = report;

    if (report) {
      this.loadSelectedReportPreview();
    } else {
      this.clearPreview();
      this.refreshView();
    }
  }

  selectReport(item: ReportCatalogItemDTO): void {
    this.selectedReport = item;
    this.selectedReportType = item.type;
    this.loadSelectedReportPreview();
    this.refreshView();
  }

  reloadCurrentPreview(): void {
    this.loadSelectedReportPreview();
  }

  downloadSelectedPdf(): void {
    if (!this.selectedReport || this.isDownloadingPdf) {
      return;
    }

    this.downloadPdf(this.selectedReport);
  }

  downloadPdf(item: ReportCatalogItemDTO, event?: Event): void {
    event?.stopPropagation();

    if (this.isDownloadingPdf) {
      return;
    }

    this.isDownloadingPdf = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.refreshView();

    this.studentReportsService
      .downloadReportPdf(item.pdfEndpoint)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isDownloadingPdf = false;
            this.refreshView();
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.ngZone.run(() => {
            const blob = response.body;
            if (!blob) {
              this.errorMessage = 'No se recibió contenido para descargar.';
              this.refreshView();
              return;
            }

            const filename =
              this.extractFilename(response.headers.get('content-disposition')) ||
              `${item.type.toLowerCase()}.pdf`;

            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);

            this.successMessage = 'El reporte PDF se descargó correctamente.';
            this.refreshView();
          });
        },
        error: (error: unknown) => {
          this.ngZone.run(() => {
            console.error('Error descargando PDF del reporte', error);
            this.errorMessage = this.extractErrorMessage(error);
            this.refreshView();
          });
        }
      });
  }

  trackByReportType(_: number, item: ReportCatalogItemDTO): string {
    return item.type;
  }

  private loadSelectedReportPreview(): void {
    if (!this.selectedReport) {
      this.clearPreview();
      this.refreshView();
      return;
    }

    this.isLoadingPreview = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.refreshView();

    this.studentReportsService
      .getReportData(this.selectedReport.dataEndpoint)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingPreview = false;
            this.refreshView();
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: unknown) => {
          this.ngZone.run(() => {
            this.previewRawData = data;
            this.buildPreview(data);
            this.refreshView();
          });
        },
        error: (error: unknown) => {
          this.ngZone.run(() => {
            console.error('Error cargando vista previa del reporte', error);
            this.errorMessage = this.extractErrorMessage(error);
            this.clearPreview();
            this.refreshView();
          });
        }
      });
  }

  private buildPreview(data: unknown): void {
    this.previewFields = [];
    this.previewColumns = [];
    this.previewRows = [];

    if (Array.isArray(data)) {
      this.previewMode = 'array';

      if (data.length === 0) {
        this.refreshView();
        return;
      }

      const columns = this.collectColumns(data);
      this.previewColumns = columns.map((key) => ({
        key,
        label: this.formatLabel(key)
      }));

      this.previewRows = data.map((item) => this.normalizeRow(item, columns));
      this.refreshView();
      return;
    }

    if (data && typeof data === 'object') {
      const objectData = data as Record<string, unknown>;
      const keys = Object.keys(objectData);

      if (keys.length === 0) {
        this.previewMode = 'empty';
        this.refreshView();
        return;
      }

      this.previewMode = 'object';
      this.previewFields = keys.map((key) => ({
        key,
        label: this.formatLabel(key),
        value: this.formatValue(objectData[key])
      }));
      this.refreshView();
      return;
    }

    this.previewMode = 'empty';
    this.refreshView();
  }

  private clearPreview(): void {
    this.previewRawData = null;
    this.previewMode = 'empty';
    this.previewFields = [];
    this.previewColumns = [];
    this.previewRows = [];
  }

  private collectColumns(data: unknown[]): string[] {
    const unique = new Set<string>();

    data.forEach((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item as Record<string, unknown>).forEach((key) => unique.add(key));
      } else {
        unique.add('value');
      }
    });

    return Array.from(unique);
  }

  private normalizeRow(item: unknown, columns: string[]): Record<string, string> {
    const row: Record<string, string> = {};

    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const source = item as Record<string, unknown>;
      columns.forEach((column) => {
        row[column] = this.formatValue(source[column]);
      });
      return row;
    }

    columns.forEach((column) => {
      row[column] = column === 'value' ? this.formatValue(item) : '—';
    });

    return row;
  }

  private formatLabel(key: string): string {
    const customMap: Record<string, string> = {
      studentId: 'ID estudiante',
      studentFullName: 'Estudiante',
      studentEmail: 'Correo',
      careerName: 'Carrera',
      academicPeriodName: 'Período académico',
      titulationStatus: 'Estado de titulación',
      currentTitulationOption: 'Opción actual',
      optionSelectionDate: 'Fecha selección opción',
      titulationPeriodType: 'Tipo de período',
      titulationPeriodApproved: 'Período aprobado',
      approvalDate: 'Fecha aprobación',
      observations: 'Observaciones',
      currentOptionName: 'Opción actual',
      currentOptionDescription: 'Descripción',
      selectionDate: 'Fecha selección',
      lastChangeDate: 'Última fecha de cambio',
      previousOptionName: 'Opción anterior',
      changeReason: 'Motivo del cambio',
      proposalId: 'ID propuesta',
      topicSource: 'Origen del tema',
      topicTitle: 'Título',
      topicDescription: 'Descripción del tema',
      proposalSubmissionDate: 'Fecha envío',
      proposalStatus: 'Estado propuesta',
      proposalObservations: 'Observaciones propuesta',
      commissionName: 'Comisión',
      topicStatus: 'Estado tema',
      documentUrl: 'Documento',
      teacherFeedback: 'Retroalimentación docente',
      versionNumber: 'Versión',
      changeId: 'ID cambio',
      previousTopicTitle: 'Tema anterior',
      newTopicTitle: 'Tema nuevo',
      newOptionName: 'Opción nueva',
      historyId: 'ID historial',
      topicProposedId: 'ID tema propuesto',
      title: 'Título',
      description: 'Descripción',
      assignmentId: 'ID asignación',
      assignmentDate: 'Fecha asignación',
      response: 'Respuesta',
      directorId: 'ID director',
      directorFullName: 'Director',
      directorEmail: 'Correo director',
      thesisWorkId: 'ID trabajo',
      thesisStatus: 'Estado trabajo',
      tutoringId: 'ID tutoría',
      tutoringDate: 'Fecha tutoría',
      tutoringType: 'Tipo tutoría',
      modality: 'Modalidad',
      locationOrLink: 'Lugar / Enlace',
      attendance: 'Asistencia',
      registered: 'Registrada',
      reportUrl: 'Informe',
      admissionRequestId: 'ID solicitud',
      identification: 'Identificación',
      firstNames: 'Nombres',
      lastNames: 'Apellidos',
      email: 'Correo',
      facultyName: 'Facultad',
      submissionDate: 'Fecha envío',
      status: 'Estado',
      responseDate: 'Fecha respuesta'
    };

    if (customMap[key]) {
      return customMap[key];
    }

    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (match) => match.toUpperCase());
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return '—';
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const date = new Date(`${trimmed}T00:00:00`);
        return isNaN(date.getTime())
          ? trimmed
          : new Intl.DateTimeFormat('es-EC').format(date);
      }

      if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
        const dateTime = new Date(trimmed);
        return isNaN(dateTime.getTime())
          ? trimmed
          : new Intl.DateTimeFormat('es-EC', {
              dateStyle: 'short',
              timeStyle: 'short'
            }).format(dateTime);
      }

      return trimmed;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatValue(item)).join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private extractFilename(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return asciiMatch?.[1] || null;
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

      if (error.status === 404) {
        return 'No se encontraron datos para este reporte.';
      }

      if (error.status === 403) {
        return 'No tiene permisos para consultar este reporte.';
      }

      if (error.status === 401) {
        return 'La sesión no es válida o ha expirado.';
      }

      return error.message || 'No se pudo completar la operación.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'No se pudo completar la operación.';
  }

  private refreshView(): void {
    this.cdr.detectChanges();
  }
}