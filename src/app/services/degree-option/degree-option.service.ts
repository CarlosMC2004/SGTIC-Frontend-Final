import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DegreeOption } from '../../models/degree-option.model';
import {OptionCareerModel} from '../../models/option-career-model';

@Injectable({
  providedIn: 'root'
})
export class DegreeOptionService {
  private readonly API_URL = 'http://localhost:8080/api/degree-options';
  private readonly API_COORDINATOR_URL = 'http://localhost:8080/api/coordinator/degree-options';
  constructor(private http: HttpClient) {}

  save(option: DegreeOption): Observable<DegreeOption> {
    return this.http.post<DegreeOption>(this.API_URL, option);
  }

  getOptionsForCoordinator(idCarrera: number): Observable<OptionCareerModel[]> {
    return this.http.get<OptionCareerModel[]>(`${this.API_COORDINATOR_URL}/career/${idCarrera}`);
  }

  toggleCoordinatorOption(idUsuario: number, idOpcion: number, seleccionado: boolean): Observable<void> {
    return this.http.post<void>(
      `${this.API_COORDINATOR_URL}/user/${idUsuario}/toggle/${idOpcion}?seleccionado=${seleccionado}`,
      {}
    );
  }
}
