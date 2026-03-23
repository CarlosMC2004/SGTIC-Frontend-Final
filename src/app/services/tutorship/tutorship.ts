import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  TutorshipReportDTO, TutorshipRequestDTO, TutorshipResponseDTO } from '../../models/tutorship.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TutorshipService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/teacher/tutorships';

  getMyTutorships(): Observable<TutorshipResponseDTO[]> {
    return this.http.get<TutorshipResponseDTO[]>(this.apiUrl);
  }

  scheduleTutorship(request: TutorshipRequestDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }

  getAssignedWorks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned-works`);
  }

  registerTutorshipReport(idTutoring: number, report: TutorshipReportDTO, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('reportData', new Blob([JSON.stringify(report)], { type: 'application/json' }));
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/${idTutoring}/report`, formData);
  }

  downloadReport(id: number): Observable<Blob> {
    // Es vital especificar responseType: 'blob'
    return this.http.get(`${this.apiUrl}/${id}/report/download`, {
      responseType: 'blob'
    });
  }
}
