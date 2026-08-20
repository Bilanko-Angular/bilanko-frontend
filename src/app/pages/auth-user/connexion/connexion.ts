// src/app/pages/auth-user/connexion/connexion.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthUser } from "../auth-user";
import { User } from '../../../models/person';
import { AuthStoreService } from '../../../service/store/auth/auth-store.service';

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
  private readonly authStore = inject(AuthStoreService);

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

  async soumettre(event: Event): Promise<void> {
    event.preventDefault();

    if (this.connectionForm.invalid) {
      this.connectionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const formValue = this.connectionForm.value;
    const user: User = {
      email: formValue.email ?? '',
      password: formValue.password ?? '',
    };

    try {
      await this.authStore.login(user);
      console.log('Connexion réussie ! Token :', this.authStore.token());
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Échec de la connexion', error);
      this.loginError = error?.message || 'Identifiants incorrects ou erreur serveur.';
    } finally {
      this.isLoading = false;
    }
  }
}
