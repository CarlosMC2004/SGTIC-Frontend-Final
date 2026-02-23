import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacultyDashboardDTO {
  id: number;
  name: string;
  subtitle: string;
  careersCount: number;
  careers: string[];

  icon?: string;
  iconBg?: string;
  iconColor?: string;
}

@Injectable({
  providedIn: 'root',
})

export class FacultyDashboardAdmin {
  
  private http = inject(HttpClient);


  private apiUrl = 'http://localhost:8080/api/faculties';

  getDashboardData(): Observable<FacultyDashboardDTO[]> {
    return this.http.get<FacultyDashboardDTO[]>(`${this.apiUrl}/dashboard`);
  } 
}
