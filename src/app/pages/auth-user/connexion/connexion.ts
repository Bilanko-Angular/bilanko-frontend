// src/app/pages/auth-user/connexion/connexion.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthUser } from "../auth-user";

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [AuthUser, ReactiveFormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly connectionForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = false;
  loginError = '';

  get email() { return this.connectionForm.controls.email; }
  get password() { return this.connectionForm.controls.password; }

  /* ── Bouton Google ── */
  loginWithGoogle(): void {
    console.log('Connexion avec Google');
    // Redirection vers la page d'accueil
    this.router.navigate(['/']);
  }

  /* ── Soumission du formulaire ── */
  soumettre(event: Event): void {
    event.preventDefault();
    
    if (this.connectionForm.invalid) {
      this.connectionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    // Simuler une requête API
    setTimeout(() => {
      this.isLoading = false;
      console.log('Connexion :', this.connectionForm.value);
      // Redirection vers la page d'accueil
      this.router.navigate(['/']);
    }, 800);
  }
}