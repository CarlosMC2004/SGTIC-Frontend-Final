import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User, RoleDTO, CareerDTO, AcademicPeriodDTO, FacultyDTO, SelectionItemDTO} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getRoles(): Observable<RoleDTO[]> {
    return this.http.get<RoleDTO[]>(`${this.API_URL}/users/roles`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/users`, user);
  }

  getActiveCareers(): Observable<CareerDTO[]> {
    return this.http.get<CareerDTO[]>(`${this.API_URL}/catalog/careers/active`);
  }

  getActivePeriods(): Observable<AcademicPeriodDTO[]> {
    return this.http.get<AcademicPeriodDTO[]>(`${this.API_URL}/catalog/periods/active`);
  }

  getFaculties(): Observable<SelectionItemDTO[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/public/selection/faculties`);
  }

  getCareersByFaculty(facultyId: number): Observable<any[]> {
    return this.http.get<SelectionItemDTO[]>(`http://localhost:8080/api/public/selection/faculties/${facultyId}/careers`);
  }
}
