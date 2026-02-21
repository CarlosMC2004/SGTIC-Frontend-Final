import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdmissionRequest {
  idRequest: number;
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  career: {
    idCareer: number;
    name: string;
  };
  sentDate: string;
  status: string;
  observations: string;
}

@Injectable({
  providedIn: 'root'
})

export class AdmissionRequestsService {

  private apiUrl = 'http://localhost:8080/api/solicitudes';
  constructor(private http: HttpClient) { }
  getAllRequests(): Observable<AdmissionRequest[]> {
    return this.http.get<AdmissionRequest[]>(this.apiUrl);
  }
}
