import { Component, inject } from '@angular/core';
import { AuthUser } from "../auth-user";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/person';
import { AuthStoreService } from '../../../service/store/auth/auth-store.service';

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
  private readonly authStore = inject(AuthStoreService);

  /* ── Getters ─────────────────────────────────────────── */
  get email()    { return this.connectionForm.controls.email; }
  get password() { return this.connectionForm.controls.password; }

  /* ── Actions ─────────────────────────────────────────── */
  loginWithGoogle(): void {
    // TODO: intégrer Firebase Auth / Google OAuth
    console.log('Connexion avec Google');
  }

  async soumettre(event: Event) {
    if (this.connectionForm.invalid) return;
    const formValue = this.connectionForm.value;
    const user: User = {
      email:  formValue.email  ?? '',
      password: formValue.password ?? '',
    };
    try {
      await this.authStore.login(user);
      console.log('Connexion réussie ! Token :', this.authStore.token());
      // Plus tard, tu pourras ajouter une redirection ici avec le Router (ex: this.router.navigate(['/dashboard']))
    } catch (error) {
      console.error('Échec de la connexion', error);
    }
  }
}
