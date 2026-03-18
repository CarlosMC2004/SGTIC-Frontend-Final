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

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPeriodos(): Observable<Periodo[]> {
    const headers = this.getHeaders();
    return this.http.get<Periodo[]>(this.apiUrl, { headers });
  }

  getPeriodosActivos(): Observable<Periodo[]> {
    const headers = this.getHeaders();
    return this.http.get<Periodo[]>(`${this.apiUrl}/active`, { headers });
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