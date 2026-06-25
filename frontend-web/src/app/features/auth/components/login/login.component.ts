import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      rut: ['', [Validators.required]],
      clave: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Auto-formato de RUT (ej: 12.345.678-9)
    this.loginForm.get('rut')?.valueChanges.subscribe(value => {
      if (!value) return;
      let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
      let formatted = clean;
      if (clean.length > 1) {
        formatted = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + clean.slice(-1);
      }
      if (value !== formatted) {
        this.loginForm.get('rut')?.setValue(formatted, { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Validación de Rol para plataforma Web (Carabineros)
        if (response.rol === 'Sordo' || response.rol.toLowerCase() === 'sordo') {
          this.errorMessage = 'Acceso denegado. Esta plataforma es de uso exclusivo para Carabineros. Por favor, utilice la aplicación móvil.';
          return;
        }

        this.authService.saveToken(response.token);
        
        // Redirigir al Landing Page
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'RUT o clave única incorrectos.';
        } else {
          this.errorMessage = 'Error de conexión con el servidor.';
        }
      }
    });
  }
}
