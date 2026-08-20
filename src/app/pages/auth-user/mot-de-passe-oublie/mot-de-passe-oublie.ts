// src/app/pages/auth-user/mot-de-passe-oublie/mot-de-passe-oublie.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthUser } from "../auth-user";

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [AuthUser, ReactiveFormsModule, RouterLink],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrl: './mot-de-passe-oublie.css',
})
export class MotDePasseOublie {
  private readonly fb = inject(FormBuilder);

  envoye = false;
  isLoading = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() { return this.form.controls.email; }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simuler une requête API
    setTimeout(() => {
      this.isLoading = false;
      console.log('Lien envoyé à :', this.form.value.email);
      this.envoye = true;
    }, 800);
  }

  resetForm(): void {
    this.envoye = false;
    this.form.reset();
    this.errorMessage = '';
  }
}