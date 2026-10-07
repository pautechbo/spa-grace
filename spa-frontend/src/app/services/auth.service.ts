import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';

// Definimos una interfaz para el objeto de usuario
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  id_empleado?: number;
}

// Definimos una interfaz para la respuesta del login
export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  public currentUser = signal<User | undefined>(undefined);

  constructor() {
    // Al iniciar el servicio, comprobamos el estado de la autenticación.
    this.checkAuthStatus().subscribe();
  }

  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuthentication(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.currentUser.set(undefined);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Comprueba si hay un token válido y, si es así, obtiene el perfil del usuario.
   */
  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.logout();
      return of(false);
    }

    // El endpoint /profile del backend devuelve un User, no un AuthResponse.
    // Lo ajustamos para que espere un User.
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        // Como /profile no devuelve un nuevo token, solo actualizamos el usuario.
        this.currentUser.set(user);
      }),
      map(() => true), // Si la petición tiene éxito, transformamos la respuesta en 'true'.
      catchError(() => {
        this.logout();
        return of(false); // Si falla, devolvemos 'false'.
      })
    );
  }

  /**
   * Método privado para centralizar el guardado del token y el usuario.
   */
  private setAuthentication(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    this.currentUser.set(authResponse.user);
  }
}
