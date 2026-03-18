import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, CurrentUser, UserContext } from '../models/user.model';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userContext: UserContext | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  private setSession(authResult: LoginResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, authResult.token);

    const user: CurrentUser = {
      email: authResult.email,
      fullName: authResult.fullName,
      roles: authResult.roles,
      context: authResult.context,
      primerIngreso: authResult.primerIngreso
    };

    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.userContext = authResult.context;
  }

  private loadStoredUser(): void {
    const userStr = sessionStorage.getItem(this.USER_KEY);

    if (!userStr) {
      return;
    }

    try {
      const user: CurrentUser = JSON.parse(userStr);
      this.currentUserSubject.next(user);
      this.userContext = user.context;
    } catch (error) {
      console.error('Error al cargar usuario almacenado:', error);
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      this.currentUserSubject.next(null);
      this.userContext = null;
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.userContext = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.some(role => roles.includes(role)) : false;
  }

  getUserContext(): UserContext | null {
    return this.userContext;
  }

  getFacultyId(): number | null {
    return this.userContext?.idFaculty || null;
  }

  getCareerId(): number | null {
    return this.userContext?.idCareer || null;
  }

  changeFirstPassword(newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/change-password`, { newPassword }).pipe(
      tap(() => {
        const currentUser = this.currentUserSubject.value;

        if (currentUser) {
          currentUser.primerIngreso = true;
          sessionStorage.setItem(this.USER_KEY, JSON.stringify(currentUser));
          this.currentUserSubject.next({ ...currentUser });
        }
      })
    );
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId ? Number(decoded.userId) : null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
}