import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeacherAssignment } from '../../models/teacher-assignment.model';
import { PendingProject } from '../../models/pending-project.model';
import { AiMatchResult } from '../../models/ai-match-result.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherAssignmentService {
  private apiUrl = 'http://localhost:8080/api/asignaciones';

  constructor(private http: HttpClient) { }

  getAvailableTeachers(idCoordinador: number): Observable<TeacherAssignment[]> {
    return this.http.get<TeacherAssignment[]>(`${this.apiUrl}/docentes-disponibles/${idCoordinador}`);
  }

  getPendingProjects(idCoordinador: number): Observable<PendingProject[]> {
    return this.http.get<PendingProject[]>(`${this.apiUrl}/proyectos-pendientes/${idCoordinador}`);
  }

  assignDirector(idPropuesta: number, idDocente: number, idPeriodo: number): Observable<any> {
    const payload = { idPropuesta, idDocente, idPeriodo };
    return this.http.post(`${this.apiUrl}/asignar`, payload);
  }

  getAiSuggestions(titulo: string, descripcion: string, docentes: TeacherAssignment[]): Observable<AiMatchResult[]> {
    const payload = {
      titulo: titulo,
      descripcion: descripcion,
      docentes: docentes
    };
    return this.http.post<AiMatchResult[]>(`${this.apiUrl}/sugerir-ia`, payload);
  }
}
