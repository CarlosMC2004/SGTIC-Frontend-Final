import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditoriaSistema } from '../models/auditoria.model'; // Ajusta tu ruta

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private apiUrl = 'http://localhost:8080/api/auditoria';

  constructor(private http: HttpClient) { }

  obtenerHistorial(): Observable<AuditoriaSistema[]> {
    return this.http.get<AuditoriaSistema[]>(this.apiUrl);
  }
}
