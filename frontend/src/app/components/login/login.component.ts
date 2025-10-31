import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, LoginData } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  loadingGoogle = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.showMessage('Por favor completa todos los campos');
      return;
    }

    this.loading = true;
    const loginData: LoginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.requires2fa) {
          // Redirigir a verificación 2FA
          this.showMessage('Código 2FA enviado a tu correo');
          this.router.navigate(['/verify-2fa'], {
            state: {
              tempToken: response.tempToken,
              type: 'login',
              destination: response.destino
            }
          });
        } else if (response.ok) {
          // Login directo sin 2FA (usuarios no verificados)
          this.showMessage('¡Inicio de sesión exitoso!');
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al iniciar sesión';
        this.showMessage(errorMsg);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    this.loadingGoogle = true;

    try {
      const response = await this.authService.loginWithGoogle();

      if (response.ok) {
        this.showMessage('¡Inicio de sesión con Google exitoso!');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      const errorMsg = error.error?.error || 'Error al iniciar sesión con Google';
      this.showMessage(errorMsg);
    } finally {
      this.loadingGoogle = false;
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
