import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RequestAccessDTO {
  identificacion: string;
  correo: string;
  nombres: string;
  apellidos: string;
  idFacultad: number;
  idCarrera: number;
}

@Injectable({
  providedIn: 'root',
})

export class RequestAccess {
  private apiUrl = 'http://localhost:8080/api/request-access';

  constructor(private http: HttpClient) { }

  enviarSolicitud(datos: RequestAccessDTO): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}