import { Injectable, inject } from '@angular/core';
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
  idCarrera: number;
  idOpcion: number;
  nombreOpcion: string;
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
}

@Injectable({
  providedIn: 'root'
})
export class ProcessSetupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  getActiveOptions(): Observable<DegreeOptionDTO[]> {
    return this.http.get<DegreeOptionDTO[]>(`${this.apiUrl}/degree-options/active`);
  }

  getTemasDisponibles(idOpcion: number): Observable<TemaDTO[]> {
    const params = new HttpParams().set('idOpcion', idOpcion.toString());

    return this.http.get<TemaDTO[]>(`${this.apiUrl}/temas/disponibles`, { params });
  }

  saveTopicSelection(payload: SaveTopicSelectionRequestDTO): Observable<SaveTopicSelectionResponseDTO> {
    return this.http.post<SaveTopicSelectionResponseDTO>(`${this.apiUrl}/temas/seleccion`, payload);
  }

  extractErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    if (error.status === 400) {
      return 'La solicitud enviada no es válida.';
    }

    if (error.status === 401) {
      return 'Tu sesión no es válida o ha expirado.';
    }

    if (error.status === 409) {
      return 'No fue posible guardar la selección por una regla de negocio.';
    }

    if (error.status >= 500) {
      return 'Ocurrió un error interno en el servidor.';
    }

    return 'Ocurrió un error inesperado.';
  }
}