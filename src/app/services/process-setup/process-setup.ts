import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DegreeOptionDTO {
  idOption: number;
  name: string;
  description: string;
}

export interface TemaDTO {
  idTema: number;
  titulo: string;
  descripcion: string;
  idCarrera?: number;
  idOpcion?: number;
  nombreOpcion?: string;
  profesor?: string;
  area?: string;
  duracion?: string;
}

export interface SaveTopicSelectionRequestDTO {
  idTema: number;
  idOpcion: number;
  idPeriodo: number;
}

export interface SaveTopicSelectionResponseDTO {
  message: string;
  idTema: number;
  idOpcion: number;
  idPeriodo: number;
  fechaLimiteSeleccion: string;
  cambioTema: boolean;
}

export interface RegisterProposalStudentTopicRequestDTO {
  idOpcion: number;
  idPeriodo: number;
  titulo: string;
  descripcion: string;
  documento: File | null;
}

export interface RegisterProposalStudentTopicResponseDTO {
  mensaje: string;
  idTemaPropuesto: number | null;
  idPropuesta: number;
  idOpcion: number;
  idPeriodo: number;
  fechaLimiteSeleccion: string;
}

export interface UpdateStudentProposalRequestDTO {
  idOpcion: number;
  titulo: string;
  descripcion: string;
  documento: File | null;
}

export interface UpdateStudentProposalResponseDTO {
  mensaje: string;
  idPropuesta: number;
  numeroVersion: number;
}

export interface TopicSelectionStatusDTO {
  estadoTitulacion: string;
  tipoTemaActual: 'NINGUNO' | 'BANCO' | 'PROPUESTO';
  fueraDePlazo: boolean;
  desactivadoPorPlazo: boolean;
  tieneProcesoTema: boolean;
  tieneSeleccionBanco: boolean;
  puedeSeleccionar: boolean;
  puedeProponer: boolean;
  puedeCambiarTema: boolean;
  cambiosTemaRealizados: number;
  fechaLimiteSeleccion: string;
  mensaje: string;
}

export interface StudentProposalSummaryDTO {
  idPropuesta: number;
  idTemaPropuesto: number;
  titulo: string;
  descripcion: string;
  estadoPropuesta: string;
  estadoTema: string;
  feedbackDocente: string | null;
  urlDocumento: string | null;
  idOpcion: number | null;
  nombreOpcion: string | null;
  numeroVersion: number;
  totalVersiones: number;
  fechaEnvio: string;
  fechaUltimaActualizacion: string;
  editable: boolean;
}

export interface StudentProposalHistoryItemDTO {
  numeroVersion: number;
  esVersionActual: boolean;
  titulo: string;
  descripcion: string;
  urlDocumento: string | null;
  idOpcion: number | null;
  nombreOpcion: string | null;
  estadoPropuesta: string;
  estadoTema: string;
  feedbackDocente: string | null;
  fechaEnvio: string;
  fechaMovimiento: string;
  motivo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessSetupService {
  private readonly temasUrl = 'http://localhost:8080/api/temas';
  private readonly degreeOptionsUrl = 'http://localhost:8080/api/degree-options';

  constructor(private http: HttpClient) {}

  getActiveOptions(): Observable<DegreeOptionDTO[]> {
    return this.http.get<DegreeOptionDTO[]>(`${this.degreeOptionsUrl}/active`);
  }

  getTemasDisponibles(idOpcion: number): Observable<TemaDTO[]> {
    const params = new HttpParams().set('idOpcion', idOpcion);
    return this.http.get<TemaDTO[]>(`${this.temasUrl}/disponibles`, { params });
  }

  getTopicSelectionStatus(idPeriodo: number): Observable<TopicSelectionStatusDTO> {
    const params = new HttpParams().set('idPeriodo', idPeriodo);
    return this.http.get<TopicSelectionStatusDTO>(`${this.temasUrl}/estado`, { params });
  }

  saveTopicSelection(payload: SaveTopicSelectionRequestDTO): Observable<SaveTopicSelectionResponseDTO> {
    return this.http.post<SaveTopicSelectionResponseDTO>(`${this.temasUrl}/seleccion`, payload);
  }

  registerProposalStudentTopic(
    payload: RegisterProposalStudentTopicRequestDTO
  ): Observable<RegisterProposalStudentTopicResponseDTO> {
    const formData = new FormData();
    formData.append('idOpcion', String(payload.idOpcion));
    formData.append('idPeriodo', String(payload.idPeriodo));
    formData.append('titulo', payload.titulo);
    formData.append('descripcion', payload.descripcion);

    if (payload.documento) {
      formData.append('documento', payload.documento, payload.documento.name);
    }

    return this.http.post<RegisterProposalStudentTopicResponseDTO>(
      `${this.temasUrl}/propuesta-estudiante`,
      formData
    );
  }

  getStudentProposals(idPeriodo: number): Observable<StudentProposalSummaryDTO[]> {
    const params = new HttpParams().set('idPeriodo', idPeriodo);
    return this.http.get<StudentProposalSummaryDTO[]>(`${this.temasUrl}/propuestas-estudiante`, { params });
  }

  getStudentProposalHistory(idPropuesta: number): Observable<StudentProposalHistoryItemDTO[]> {
    return this.http.get<StudentProposalHistoryItemDTO[]>(
      `${this.temasUrl}/propuestas-estudiante/${idPropuesta}/historial`
    );
  }

  updateStudentProposal(
    idPropuesta: number,
    payload: UpdateStudentProposalRequestDTO
  ): Observable<UpdateStudentProposalResponseDTO> {
    const formData = new FormData();
    formData.append('idOpcion', String(payload.idOpcion));
    formData.append('titulo', payload.titulo);
    formData.append('descripcion', payload.descripcion);

    if (payload.documento) {
      formData.append('documento', payload.documento, payload.documento.name);
    }

    return this.http.put<UpdateStudentProposalResponseDTO>(
      `${this.temasUrl}/propuestas-estudiante/${idPropuesta}`,
      formData
    );
  }

  extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error?.message) {
        return error.error.message;
      }

      if (error.error?.mensaje) {
        return error.error.mensaje;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }

      return `Error ${error.status}: ${error.statusText || 'Solicitud no procesada.'}`;
    }

    return 'Ocurrió un error inesperado.';
  }
}