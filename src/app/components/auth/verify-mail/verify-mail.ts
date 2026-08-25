import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-mail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-mail.html',
  styleUrl: './verify-mail.css'
})
export class VerifyMailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  
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

    const emailValue = this.form.value.email ?? '';

    this.http.post<any>(`${environment.baseApiUrl}/auth/password/forgot`, { email: emailValue })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.envoye = true;
            setTimeout(() => {
              this.mailVerified.emit(emailValue);
            }, 2000);
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de l\'envoi du lien.';
        }
      });
  }

  resetForm(): void {
    this.envoye = false;
    this.form.reset();
    this.errorMessage = '';
  }
}
