import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthUser } from "../auth-user";
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [ReactiveFormsModule, AuthUser, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly prefs = inject(PreferencesService);

  isLoading = false;
  registerError = '';
  registerSuccess = false;

  readonly inscriptionForm = this.fb.group(
    {
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,}$/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordsMatchValidator }
  );

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get nom() { return this.inscriptionForm.controls.nom; }
  get prenom() { return this.inscriptionForm.controls.prenom; }
  get email() { return this.inscriptionForm.controls.email; }
  get password() { return this.inscriptionForm.controls.password; }
  get confirmPassword() { return this.inscriptionForm.controls.confirmPassword; }

  hasMinLength(): boolean { return (this.password.value || '').length >= 8; }
  hasUpperCase(): boolean { return /[A-Z]/.test(this.password.value || ''); }
  hasLowerCase(): boolean { return /[a-z]/.test(this.password.value || ''); }
  hasNumber(): boolean { return /[0-9]/.test(this.password.value || ''); }
  hasSpecialChar(): boolean { return /[#?!@$%^&*-]/.test(this.password.value || ''); }

  soumettre(): void {
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    this.registerSuccess = false;

    setTimeout(() => {
      this.isLoading = false;
      this.registerSuccess = true;
      console.log('Inscription réussie :', this.inscriptionForm.value);

      setTimeout(() => {
        this.router.navigate(['/connexion']);
      }, 1500);
    }, 800);
  }
}