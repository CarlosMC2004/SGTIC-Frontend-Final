import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Periodo {
  idPeriod: number;
  name: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  enrollmentDeadline?: string;
  plazoCambioTema?: number;
  minimoAvances?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  private apiUrl = 'http://localhost:8080/api/admin/catalog/periods';
  private studentApiUrl = 'http://localhost:8080/api/student/periodos';
  // NUEVA RUTA COMÚN PARA TODOS LOS ROLES
  private commonApiUrl = 'http://localhost:8080/api/common/periods';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    // Usamos sessionStorage para que funcione correctamente con tu AuthService
    const token = sessionStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPeriodos(): Observable<Periodo[]> {
    const headers = this.getHeaders();
    return this.http.get<Periodo[]>(this.apiUrl, { headers });
  }

  // ESTE ES EL MÉTODO QUE USARÁ EL TOP-BAR PARA TODOS
  getPeriodosActivos(): Observable<Periodo[]> {
    const headers = this.getHeaders();
    return this.http.get<Periodo[]>(`${this.commonApiUrl}/active`, { headers });
  }

  getPeriodosAceptados(): Observable<Periodo[]> {
    const headers = this.getHeaders();
    return this.http.get<Periodo[]>(`${this.studentApiUrl}/aceptados`, { headers });
  }

  createPeriodo(periodo: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(this.apiUrl, periodo, { headers });
  }

  updatePeriodo(id: number, periodo: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/${id}`, periodo, { headers });
  }

  deletePeriodo(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}