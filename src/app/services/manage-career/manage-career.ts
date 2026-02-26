import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ManageCareerDTO {
  idCareer: number;
  faculty: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})

export class ManageCareer {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/careers';

  updateCareer(id: number, career: ManageCareerDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, career);
  }

  toggleCareerStatus(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, {});
  }
}
