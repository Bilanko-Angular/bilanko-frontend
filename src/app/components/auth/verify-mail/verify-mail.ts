import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-mail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-mail.html',
  styleUrl: './verify-mail.css'
})
export class VerifyMailComponent {
  private readonly fb = inject(FormBuilder);
  
  mailVerified = output<string>();

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
      this.envoye = true;
      console.log('Lien envoyé à :', this.form.value.email);
      setTimeout(() => {
        this.mailVerified.emit(this.form.value.email ?? '');
      }, 2000);
    }, 1000);
  }

  resetForm(): void {
    this.envoye = false;
    this.form.reset();
    this.errorMessage = '';
  }
}
