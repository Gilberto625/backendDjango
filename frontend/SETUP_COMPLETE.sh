#!/bin/bash

echo "🚀 Configurando Frontend Angular Completo..."
echo "=============================================="

# Crear archivo de Login Component TypeScript
cat > src/app/components/login/login.component.ts << 'EOF'
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
EOF

echo "✅ Login Component TS creado"

# Crear archivo de Login Component HTML
cat > src/app/components/login/login.component.html << 'EOF'
<div class="login-container">
  <mat-card class="login-card">
    <mat-card-header>
      <mat-card-title>Iniciar Sesión</mat-card-title>
    </mat-card-header>

    <mat-card-content>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" formControlName="email" placeholder="juan@example.com">
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
              El correo es obligatorio
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
              Ingresa un correo válido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              La contraseña es obligatoria
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="submit-button">
            <span *ngIf="!loading">Iniciar Sesión</span>
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
          </button>
        </div>

        <mat-divider class="divider"></mat-divider>

        <div class="google-login">
          <button mat-raised-button type="button" (click)="loginWithGoogle()" [disabled]="loadingGoogle" class="google-button">
            <span *ngIf="!loadingGoogle">🔐 Iniciar con Google</span>
            <mat-spinner *ngIf="loadingGoogle" diameter="20"></mat-spinner>
          </button>
        </div>

        <div class="register-link">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
        </div>
      </form>
    </mat-card-content>
  </mat-card>
</div>
EOF

echo "✅ Login Component HTML creado"

# Crear archivo de Login Component CSS
cat > src/app/components/login/login.component.css << 'EOF'
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

mat-card-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

mat-card-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.form-row {
  margin-bottom: 15px;
}

.full-width {
  width: 100%;
}

.form-actions {
  margin-top: 20px;
  text-align: center;
}

.submit-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.divider {
  margin: 30px 0;
}

.google-login {
  text-align: center;
  margin-bottom: 20px;
}

.google-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background-color: #4285f4;
  color: white;
}

.google-button:hover:not([disabled]) {
  background-color: #357ae8;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

mat-spinner {
  margin: 0 auto;
}
EOF

echo "✅ Login Component CSS creado"

echo ""
echo "✨ ¡Configuración completada!"
echo ""
echo "Archivos creados:"
echo "  - Login Component (TS, HTML, CSS)"
echo ""
echo "Próximos pasos:"
echo "  1. Ejecuta: bash SETUP_VERIFY2FA.sh (para crear el componente de verificación 2FA)"
echo "  2. Ejecuta: bash SETUP_HOME.sh (para crear el componente Home)"
echo "  3. Ejecuta: bash SETUP_APP.sh (para configurar el componente principal)"
echo ""
EOF

chmod +x /home/user/frontendAngular/SETUP_COMPLETE.sh
