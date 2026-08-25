import { Component, inject, output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-your-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-your-password.html',
  styleUrl: './reset-your-password.css'
})
export class ResetYourPasswordComponent {
  @ViewChild('passwordInput') passwordInput!: HTMLInputElement;
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: HTMLInputElement;
  showPassword = false;
  private readonly fb = inject(FormBuilder);
  passwordReset = output<void>();

  isLoading = false;
  success = false;

  readonly resetForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordsMatchValidator }
  );

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get password() { return this.resetForm.controls.password; }
  get confirmPassword() { return this.resetForm.controls.confirmPassword; }

  hasMinLength(): boolean { return (this.password.value || '').length >= 8; }
  hasUpperCase(): boolean { return /[A-Z]/.test(this.password.value || ''); }
  hasLowerCase(): boolean { return /[a-z]/.test(this.password.value || ''); }
  hasNumber(): boolean { return /[0-9]/.test(this.password.value || ''); }
  hasSpecialChar(): boolean { return /[#?!@$%^&*-]/.test(this.password.value || ''); }

  soumettre(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Simuler l'appel API
    setTimeout(() => {
      this.isLoading = false;
      this.success = true;
      setTimeout(() => {
        this.passwordReset.emit();
      }, 2000);
    }, 1000);
  }
    togglePasswordVisibility(inputElement: HTMLInputElement): void {
    this.showPassword = !this.showPassword;
    if (this.showPassword) {
      inputElement.type = 'text';
    } else {
      inputElement.type = 'password';
    }
  }
}
