import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/person';
import { AuthUser } from "../auth-user";
import { AuthApiService } from '../../../service/api/auth/auth-api.service';


@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, AuthUser, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  private readonly fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  readonly inscriptionForm = this.fb.group(
    {
      nom:             ['', [Validators.required, Validators.minLength(3)]],
      prenom:          [''],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,}$/)]],
      confirmPassword: ['',  Validators.required],
    },
    { validators: this.passwordsMatchValidator }
  );

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password        = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /* ── Getters ─────────────────────────────────────────── */
  get nom()             { return this.inscriptionForm.controls.nom; }
  get prenom()          { return this.inscriptionForm.controls.prenom; }
  get email()           { return this.inscriptionForm.controls.email; }
  get password()        { return this.inscriptionForm.controls.password; }
  get confirmPassword() { return this.inscriptionForm.controls.confirmPassword; }

  /* ── Checklist mot de passe ──────────────────────────── */
  hasMinLength():    boolean { return (this.password.value || '').length >= 8; }
  hasUpperCase():    boolean { return /[A-Z]/.test(this.password.value || ''); }
  hasLowerCase():    boolean { return /[a-z]/.test(this.password.value || ''); }
  hasNumber():       boolean { return /[0-9]/.test(this.password.value || ''); }
  hasSpecialChar():  boolean { return /[#?!@$%^&*-]/.test(this.password.value || ''); }
  allCriteriaMet():  boolean { return this.hasMinLength() && this.hasUpperCase() && this.hasLowerCase() && this.hasNumber() && this.hasSpecialChar(); }

  /* ── Actions ─────────────────────────────────────────── */
  loginWithGoogle(): void {
    // TODO: intégrer Firebase Auth / Google OAuth
    console.log('Inscription avec Google');
  }

  soumettre(): void {
    console.log("test")
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched(); // affiche les erreurs si l'utilisateur clique alors que c'est invalide
      return;
    }

    const formValue = this.inscriptionForm.value;
    const user: User = {
      nom:    formValue.nom    ?? '',
      subname: formValue.prenom ?? '',
      email:  formValue.email  ?? '',
      password: formValue.password ?? '',
    };
    this.authApiService.register(user);
  }
}
