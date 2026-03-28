import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auditoria';

  obtenerSesionesUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sesiones`);
  }

  cerrarSesionUsuario(idUsuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sesiones/${idUsuario}/desconectar`, {});
  }
}
