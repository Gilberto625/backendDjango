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
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify2fa',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './verify2fa.component.html',
  styleUrl: './verify2fa.component.css'
})
export class Verify2faComponent implements OnInit {
  verifyForm!: FormGroup;
  loading = false;
  tempToken: string = '';
  type: 'register' | 'login' = 'register';
  destination: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Obtener datos del state de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as any;

    if (state) {
      this.tempToken = state.tempToken;
      this.type = state.type;
      this.destination = state.destination;
    }
  }

  ngOnInit(): void {
    // Verificar que tengamos un tempToken
    if (!this.tempToken) {
      this.showMessage('Sesión inválida. Por favor intenta de nuevo.');
      this.router.navigate(['/login']);
      return;
    }

    // Crear formulario
    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.showMessage('Ingresa un código válido de 6 dígitos');
      return;
    }

    this.loading = true;
    const codigo = this.verifyForm.value.codigo;

    // Decidir qué método llamar según el tipo
    const verifyObservable = this.type === 'register'
      ? this.authService.verifyRegister2FA(this.tempToken, codigo)
      : this.authService.verifyLogin2FA(this.tempToken, codigo);

    verifyObservable.subscribe({
      next: (response) => {
        this.loading = false;

        if (response.ok) {
          const message = this.type === 'register'
            ? '¡Registro exitoso! Ahora puedes iniciar sesión'
            : '¡Inicio de sesión exitoso!';

          this.showMessage(message);

          // Redirigir según el tipo
          if (this.type === 'register') {
            this.router.navigate(['/login']);
          } else {
            this.router.navigate(['/home']);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Código incorrecto o expirado';
        this.showMessage(errorMsg);

        // Si hay demasiados intentos, redirigir
        if (error.status === 429) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
