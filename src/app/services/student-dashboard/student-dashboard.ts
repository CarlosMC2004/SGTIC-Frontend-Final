import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStatus {
  prerequisitosNivel1: boolean;
  temaSeleccionado: boolean;
  directorAsignado: boolean;
  reunionesMinimas: boolean;
  defensaAnteproyecto: boolean;

  prerequisitosNivel2: boolean;
  asistenciaTutorias: boolean;
  predefensa: boolean;
  defensaFinal: boolean;

  nombreTema?: string;
  nombreDirector?: string;
  nombreOpcion?: string;
  totalTutorias?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StudentDashboard {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/student/dashboard';

  getStatus(periodoId: number): Observable<DashboardStatus> {
    const params = new HttpParams().set('periodoId', periodoId);

    return this.http.get<DashboardStatus>(`${this.apiUrl}/status`, { params });
  }
}