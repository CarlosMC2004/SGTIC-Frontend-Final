import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DegreeOptionDTO {
  idOption: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})

export class ProcessSetupService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:8080/api/degree-options/active";

  getActiveOptions(): Observable<DegreeOptionDTO[]> {
    return this.http.get<DegreeOptionDTO[]>(this.apiUrl);
  }
}
