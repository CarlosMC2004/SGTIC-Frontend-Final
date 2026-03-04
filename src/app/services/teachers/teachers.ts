import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl = 'http://localhost:8080/api/docentes';
  constructor(private http: HttpClient) { }

  buscarDocentes(termino: string = ''): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }
}
