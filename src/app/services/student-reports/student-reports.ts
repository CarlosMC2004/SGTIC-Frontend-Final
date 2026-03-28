import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type StudentReportType =
  | 'STATUS'
  | 'PROPOSALS'
  | 'TITULATION_OPTION'
  | 'GENERAL_STATUS'; // Agregué los de la base de datos y mantuve algunos tuyos por si los usas luego

export interface ReportCatalogItemDTO {
  type: StudentReportType;
  title: string;
  description: string;
  dataEndpoint: string;
  pdfEndpoint: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentReportsService {
  private readonly apiBase = 'http://localhost:8080';
  // CORRECCIÓN: La ruta correcta del backend
  private readonly baseUrl = `${this.apiBase}/api/student-reports`;

  constructor(private readonly http: HttpClient) {}

  getCatalog(): Observable<ReportCatalogItemDTO[]> {
    return this.http
      .get<ReportCatalogItemDTO[]>(`${this.baseUrl}/catalog`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getReportData(endpoint: string): Observable<unknown> {
    return this.http
      .get<unknown>(this.resolveEndpoint(endpoint))
      .pipe(catchError((error) => this.handleError(error)));
  }

  downloadReportPdf(endpoint: string): Observable<HttpResponse<Blob>> {
    return this.http
      .get(this.resolveEndpoint(endpoint), {
        observe: 'response',
        responseType: 'blob'
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  private resolveEndpoint(endpoint: string): string {
    if (!endpoint) {
      return this.baseUrl;
    }

    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    if (endpoint.startsWith('/')) {
      return `${this.apiBase}${endpoint}`;
    }

    return `${this.baseUrl}/${endpoint}`;
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}