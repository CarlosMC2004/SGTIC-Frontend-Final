import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacultyCreateDTO {
  name: string;
  acronym: string;
}

@Injectable({
  providedIn: 'root',
})

export class FacultyCreate {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/create-faculty'; 

  createFaculty(faculty: FacultyCreateDTO): Observable<any> {
    return this.http.post(this.apiUrl, faculty);
  }
}



/*Cuando el metodo tiene nombre en el PostMapping:
return this.http.post(`${this.apiUrl}/dashboard`, faculty); */