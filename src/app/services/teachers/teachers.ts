import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl = 'http://localhost:8080/api/teachers';

  constructor(private http: HttpClient) { }

  getDocentesPorFacultad(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/facultad/${idUsuario}`);
  }

  actualizarEstado(idDocente: number, estado: string) {
    return this.http.put(`${this.apiUrl}/${idDocente}/estado`, { estado }, { responseType: 'text' });
  }

  guardarDocente(docenteData: any) {
    return this.http.post(`${this.apiUrl}/save`, docenteData, { responseType: 'text' });
  }
}
