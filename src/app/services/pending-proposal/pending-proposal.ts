import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendingProposalDTO } from '../../models/pending-proposal.model';
import { VerificacionIAResponse } from '../../models/ia-duplication.model';

@Injectable({
  providedIn: 'root'
})
export class PendingProposalService {
  private apiUrl = 'http://localhost:8080/api/propuestas-estudiante';
  private aiUrl = 'http://localhost:8080/api/propuestas';

  constructor(private http: HttpClient) { }

  getPendientes(idCoordinador: number): Observable<PendingProposalDTO[]> {
    return this.http.get<PendingProposalDTO[]>(`${this.apiUrl}/pendientes/${idCoordinador}`);
  }

  responderPropuesta(idPropuesta: number, estado: string, motivo?: string): Observable<void> {
    let params = new HttpParams()
      .set('idPropuesta', idPropuesta.toString())
      .set('estado', estado);
    if (motivo) {
      params = params.set('motivo', motivo);
    }
    return this.http.post<void>(`${this.apiUrl}/responder`, null, { params });
  }

  verificarDuplicidadIA(idTemaPropuesto: number): Observable<VerificacionIAResponse> {
    return this.http.get<VerificacionIAResponse>(`${this.aiUrl}/${idTemaPropuesto}/verificar-duplicado`);
  }
}
