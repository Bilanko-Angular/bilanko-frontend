import { Component, inject } from '@angular/core';
import { AuthUser } from "../auth-user";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-connexion',
  imports: [AuthUser, ReactiveFormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  private readonly fb = inject(FormBuilder);

  readonly connectionForm = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /* ── Getters ─────────────────────────────────────────── */
  get email()    { return this.connectionForm.controls.email; }
  get password() { return this.connectionForm.controls.password; }

  /* ── Actions ─────────────────────────────────────────── */
  loginWithGoogle(): void {
    // TODO: intégrer Firebase Auth / Google OAuth
    console.log('Connexion avec Google');
  }

  soumettre(event: Event): void {
    if (this.connectionForm.invalid) return;
    console.log('Connexion :', this.connectionForm.value);
    // TODO: appel au service d'authentification
  }
}
