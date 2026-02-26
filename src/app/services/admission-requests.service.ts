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
  getRequestsByCareer(idCareer: number): Observable<AdmissionRequest[]> {
    return this.http.get<AdmissionRequest[]>(`http://localhost:8080/api/solicitudes/coordinador/carrera/${idCareer}`);
  }

  aprobarSolicitud(idSolicitud: number): Observable<any> {
    return this.http.put(`http://localhost:8080/api/solicitudes/aprobar/${idSolicitud}`, {});
  }

  rechazarSolicitud(idSolicitud: number, motivo: string): Observable<any> {
    const body = { motivo: motivo };
    return this.http.put(`http://localhost:8080/api/solicitudes/rechazar/${idSolicitud}`, body);
  }
}
