import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdmissionRequest {
  idSolicitud: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  carrera: string;
  facultad: string;
  periodo: string;
  fechaEnvio: string;
  estado: string;
  observaciones: string;
  fechaRespuesta: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdmissionRequestsService {

  private apiUrl = 'http://localhost:8080/api/solicitudes';

  constructor(private http: HttpClient) { }

  getRequestsByFaculty(idFaculty: number): Observable<AdmissionRequest[]> {
    return this.http.get<AdmissionRequest[]>(`${this.apiUrl}/coordinador/facultad/${idFaculty}`);
  }

  aprobarSolicitud(idSolicitud: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/aprobar/${idSolicitud}`, {});
  }

  rechazarSolicitud(idSolicitud: number, motivo: string): Observable<any> {
    // Enviamos el motivo en el cuerpo para que el sp_ lo guarde en 'observaciones'
    return this.http.put(`${this.apiUrl}/rechazar/${idSolicitud}`, { motivo: motivo });
  }
}
