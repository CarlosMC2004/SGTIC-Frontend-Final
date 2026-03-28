import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuditPageResponse } from '../models/audit-system.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditSystemService {

  private apiUrl = 'http://localhost:8080/api/auditoria';

  constructor(private http: HttpClient) { }
  getAuditorias(page: number = 0, size: number = 10): Observable<AuditPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AuditPageResponse>(this.apiUrl, { params });
  }
}
