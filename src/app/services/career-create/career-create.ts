import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CareerCreateDTO {
  faculty: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})

export class CareerCreate {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/create-careers';

  createCareer(career: CareerCreateDTO): Observable<any> {
    return this.http.post(this.apiUrl, career);
  } 
}
