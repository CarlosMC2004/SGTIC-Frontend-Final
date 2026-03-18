import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsReport {

  private baseUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  getPeriodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/periodos`);
  }

  getEstados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/estados`);
  }

  getNombreCarrera(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/carrera-nombre/${id}`, { responseType: 'text' });
  }

  getEstadisticas(idCarrera: number, idPeriodo?: number): Observable<any> {
    let params = new HttpParams().set('idCarrera', idCarrera.toString());

    if (idPeriodo && idPeriodo !== 0) {
      params = params.set('idPeriodo', idPeriodo.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/estadisticas`, { params });
  }

  getDocentesReporte(idCarrera: number, idPeriodo?: number): Observable<any[]> {
    let params = new HttpParams().set('idCarrera', idCarrera.toString());

    if (idPeriodo && idPeriodo !== 0) {
      params = params.set('idPeriodo', idPeriodo.toString());
    }

    return this.http.get<any[]>(`${this.baseUrl}/docentes`, { params });
  }

  getEstudiantesReporte(idCarrera: number, idPeriodo?: number, estado?: string, idDirector?: number): Observable<any[]> {
    let params = new HttpParams().set('idCarrera', idCarrera.toString());

    if (idPeriodo && idPeriodo !== 0) {
      params = params.set('idPeriodo', idPeriodo.toString());
    }

    if (estado && estado !== '' && estado !== 'Todos los estados') {
      params = params.set('estado', estado);
    }

    if (idDirector && idDirector !== 0) {
      params = params.set('idDirector', idDirector.toString());
    }

    return this.http.get<any[]>(`${this.baseUrl}/estudiantes`, { params });
  }
}
