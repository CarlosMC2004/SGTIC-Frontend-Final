import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TutorshipRequestDTO, TutorshipResponseDTO } from '../../models/tutorship.model';
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
}
