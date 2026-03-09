import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PendingProposalDTO } from '../../models/pending-proposal.model';

@Injectable({
  providedIn: 'root'
})
export class PendingProposalService {
  private apiUrl = 'http://localhost:8080/api/propuestas-estudiante';

  constructor(private http: HttpClient) { }

  getPendientes(idCoordinador: number): Observable<PendingProposalDTO[]> {
    return this.http.get<PendingProposalDTO[]>(`${this.apiUrl}/pendientes/${idCoordinador}`);
  }

  responderPropuesta(idPropuesta: number, estado: string): Observable<void> {
    const params = new HttpParams()
      .set('idPropuesta', idPropuesta.toString())
      .set('estado', estado);

    return this.http.post<void>(`${this.apiUrl}/responder`, null, { params });
  }
}
