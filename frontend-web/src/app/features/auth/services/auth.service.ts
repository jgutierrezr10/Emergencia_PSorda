import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoginRequest {
  rut: string;
  clave: string;
}

export interface LoginResponse {
  token: string;
  rut: string;
  nombreCompleto: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
  }

  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  saveUserData(nombre: string, rut: string): void {
    localStorage.setItem('op_name', nombre);
    localStorage.setItem('op_rut', rut);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUserName(): string {
    return localStorage.getItem('op_name') || 'Operador Juan Pérez';
  }

  getUserRut(): string {
    return localStorage.getItem('op_rut') || 'OP-12345';
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('op_name');
    localStorage.removeItem('op_rut');
  }
}
