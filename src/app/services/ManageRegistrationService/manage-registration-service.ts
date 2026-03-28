import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// La misma estructura de tu DTO en Spring Boot
export interface EnrollmentResponseDTO {
  exito: boolean;
  idMatricula: number;
  nivelMatriculado: number;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManageRegistrationService {
  private readonly http = inject(HttpClient);
  // Ajusta la URL base según tu configuración de environments
  private readonly apiUrl = 'http://localhost:8080/api/student/registration';

  autoEnroll(studentId: number): Observable<EnrollmentResponseDTO> {
    // Es un POST vacío, el ID viaja en la URL
    return this.http.post<EnrollmentResponseDTO>(`${this.apiUrl}/auto-enroll/${studentId}`, {});
  }
}