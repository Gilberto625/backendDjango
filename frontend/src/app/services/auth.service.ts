import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';

export interface Usuario {
  id?: number;
  email: string;
  username: string;
}

export interface RegisterData {
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  username: string;
  correo: string;
  contrasena: string;
  telefono: string;
  preguntasecreta: string;
  respuestasecreta: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private csrfToken: string = '';

  // BehaviorSubject para manejar el estado del usuario
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {
    // Cargar usuario del localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Obtener CSRF Token del backend Django
   */
  getCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/csrf/`, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          this.csrfToken = response.csrfToken;
        })
      );
  }

  /**
   * Headers con CSRF token
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.csrfToken
    });
  }

  /**
   * REGISTRO: Paso 1 - Registrar usuario y enviar código 2FA
   */
  register(data: RegisterData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register/`,
      data,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * REGISTRO: Paso 2 - Verificar código 2FA del registro
   */
  verifyRegister2FA(tempToken: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register/2fa/verificar/`,
      { tempToken, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * LOGIN: Paso 1 - Iniciar sesión y enviar código 2FA
   */
  login(data: LoginData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login/`,
      data,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * LOGIN: Paso 2 - Verificar código 2FA del login
   */
  verifyLogin2FA(tempToken: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login/2fa/verificar/`,
      { tempToken, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        if (response.ok) {
          this.setCurrentUser(response.usuario);
        }
      })
    );
  }

  /**
   * LOGIN CON GOOGLE
   */
  async loginWithGoogle(): Promise<any> {
    try {
      // Autenticar con Google usando Firebase
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(this.auth, provider);

      // Obtener el ID token de Firebase
      const idToken = await result.user.getIdToken();

      // Enviar el token al backend Django
      return this.http.post(
        `${this.apiUrl}/login/google/`,
        { idToken },
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      ).pipe(
        tap((response: any) => {
          if (response.ok) {
            this.setCurrentUser(response.usuario);
          }
        })
      ).toPromise();

    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  }

  /**
   * Establecer usuario actual
   */
  private setCurrentUser(usuario: Usuario): void {
    this.currentUserSubject.next(usuario);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('currentUser', JSON.stringify(usuario));
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
  }

  /**
   * Recuperar contraseña
   */
  recuperarContrasena(email: string, preguntaSecreta: string, respuestaSecreta: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/recuperar/`,
      { email, preguntaSecreta, respuestaSecreta },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Restablecer contraseña
   */
  restablecerContrasena(tempToken: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restablecer/`,
      { tempToken, nuevaContrasena },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }
}
