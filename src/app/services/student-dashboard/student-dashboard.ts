import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStatus {
  temaSeleccionado: boolean;
  directorAsignado: boolean;
  procesoIniciado: boolean;
  tribunalAsignado: boolean;
  actaEntregada: boolean;
  finalizado: boolean;
  nombreTema?: string;
  nombreDirector?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentDashboard {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/student/dashboard';
   

  getStatus(): Observable<DashboardStatus> {
    return this.http.get<DashboardStatus>(`${this.apiUrl}/status`);
  }
}
