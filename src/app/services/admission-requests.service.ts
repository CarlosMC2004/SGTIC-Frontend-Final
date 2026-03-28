import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdmissionRequest {
  id_solicitud: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  correo: string;
  carrera: string;
  facultad: string;
  periodo: string;
  fecha_envio: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class AdmissionRequestsService {
  private apiUrl = 'http://localhost:8080/api/solicitudes';

  constructor(private http: HttpClient) { }

  getRequestsByCoordinator(idUser: number): Observable<AdmissionRequest[]> {
    return this.http.get<AdmissionRequest[]>(`${this.apiUrl}/coordinador/${idUser}`);
  }

  aprobarSolicitud(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/aprobar/${id}`, null);
  }

  rechazarSolicitud(id: number, motivo: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/rechazar/${id}`, { motivo });
  }
}
