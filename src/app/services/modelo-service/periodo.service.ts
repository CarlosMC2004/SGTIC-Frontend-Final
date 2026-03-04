import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  // URL CORRECTA según tu backend
  private apiUrl = 'http://localhost:8080/api/admin/catalog/periods';

  constructor(private http: HttpClient) { }

  // Obtener todos los períodos
  getPeriodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener solo períodos activos
  getPeriodosActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active`);
  }

  // Crear un nuevo período
  createPeriodo(periodo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, periodo);
  }

  // Actualizar un período
  updatePeriodo(id: number, periodo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, periodo);
  }

  // Eliminar un período
  deletePeriodo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}