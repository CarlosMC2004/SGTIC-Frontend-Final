import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  private apiUrl = 'http://localhost:8080/api/admin/catalog/periods';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPeriodos(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  getPeriodosActivos(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/active`, { headers });
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