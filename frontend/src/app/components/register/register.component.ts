import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progressspinner';
import { AuthService, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token al iniciar
    this.authService.getCsrfToken().subscribe();

    // Crear formulario reactivo con validaciones
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidopaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidomaterno: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      preguntasecreta: ['', [Validators.required]],
      respuestasecreta: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.showMessage('Por favor completa todos los campos correctamente');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registerForm.value.contrasena !== this.registerForm.value.confirmarContrasena) {
      this.showMessage('Las contraseñas no coinciden');
      return;
    }

    this.loading = true;

    // Preparar datos sin el campo confirmarContrasena
    const { confirmarContrasena, ...registerData } = this.registerForm.value;

    this.authService.register(registerData as RegisterData).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('Código 2FA enviado a tu correo');

        // Navegar a la página de verificación 2FA con el tempToken
        this.router.navigate(['/verify-2fa'], {
          state: {
            tempToken: response.tempToken,
            type: 'register',
            destination: response.destino
          }
        });
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al registrar usuario';
        this.showMessage(errorMsg);
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
