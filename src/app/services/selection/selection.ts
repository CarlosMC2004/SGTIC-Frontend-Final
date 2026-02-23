import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SelectionItemDTO {
  id: number;
  nombre: string;
}
@Injectable({
  providedIn: 'root',
})
export class Selection {
  private http = inject(HttpClient);
  
  private baseUrl = 'http://localhost:8080/api/public/selection';

  getFaculties(): Observable<SelectionItemDTO[]> {
    return this.http.get<SelectionItemDTO[]>(`${this.baseUrl}/faculties`);
  }

  getCareersByFaculty(facultyId: number): Observable<SelectionItemDTO[]> {
    return this.http.get<SelectionItemDTO[]>(`${this.baseUrl}/faculties/${facultyId}/careers`);
  }
}
