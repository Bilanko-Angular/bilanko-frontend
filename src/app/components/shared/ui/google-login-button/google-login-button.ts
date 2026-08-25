// google-login-button.ts
import { Component, inject, AfterViewInit, ElementRef, viewChild, output, input } from '@angular/core';
import { AuthStoreService } from '../../../../service/store/auth/auth-store.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-google-login-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="btn bk-btn-google w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
      (click)="triggerGoogleLogin()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7H6.3C9.7 39.7 16.3 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.6 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
      </svg>
      <span>{{ label() }}</span>
    </button>

    <!-- Bouton Google réel, invisible, déclenché par le nôtre -->
    <div #googleBtnHidden style="position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0;"></div>
  `,
})
export class GoogleLoginButton implements AfterViewInit {
  private readonly authStore = inject(AuthStoreService);
  readonly googleBtnHidden = viewChild.required<ElementRef>('googleBtnHidden');
  readonly label = input<string>("S'inscrire avec Google");
  readonly success = output<void>();
  readonly error = output<string>();

  ngAfterViewInit(): void {
    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => this.handleCredential(response.credential),
    });

    window.google.accounts.id.renderButton(this.googleBtnHidden().nativeElement, {
      theme: 'outline',
      size: 'large',
    });
  }

  triggerGoogleLogin(): void {
    // Simule un clic sur le vrai bouton Google, rendu invisible
    const realButton = this.googleBtnHidden().nativeElement.querySelector('div[role="button"]');
    realButton?.click();
  }

  private async handleCredential(idToken: string): Promise<void> {
    try {
      await this.authStore.loginWithGoogle(idToken);
      this.success.emit();
    } catch (e) {
      console.error('Erreur Google login :', e);
      this.error.emit('Échec de la connexion Google');
    }
  }
}