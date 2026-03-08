import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BanckTemaDTO} from '../../models/banck-tema.model';

@Injectable({
  providedIn: 'root'
})
export class BanckTemaService {
  private apiUrl = 'http://localhost:8080/api/banco-temas';

  constructor(private http: HttpClient) { }

  getTemasPorUsuario(idUsuario: number): Observable<BanckTemaDTO[]> {
    return this.http.get<BanckTemaDTO[]>(`${this.apiUrl}/carrera/${idUsuario}`);
  }

  guardarTema(dto: BanckTemaDTO, idCarrera: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/guardar/${idCarrera}`, dto);
  }

  actualizarTema(tema: BanckTemaDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar`, tema);
  }

  eliminar(idTema: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${idTema}`);
  }
}
