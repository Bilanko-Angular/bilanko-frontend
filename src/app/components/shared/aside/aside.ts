import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, effect, inject, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../services/preferences';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { AuthStoreService } from '../../../service/store/auth/auth-store.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-aside',
  imports: [RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './aside.html',
  styleUrls: ['./aside.css'],
})
export class Aside {
  private readonly router = inject(Router);
  protected readonly prefs = inject(PreferencesService);
  protected readonly userStore = inject(UserStoreService);
  protected readonly authStore = inject(AuthStoreService);

  readonly profileImageError = signal(false);

  // ✅ Signal pour contrôler l'ouverture/fermeture du menu sur mobile
  readonly isOpen = signal(false);

  constructor() {
    effect(() => {
      this.userStore.user()?.profilePicture;
      this.profileImageError.set(false);
    }, { allowSignalWrites: true });
  }

  // ✅ Ouvrir le menu (uniquement sur mobile)
  openMenu(): void {
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  // ✅ Fermer le menu
  closeMenu(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  // ✅ Toggle le menu
  toggleMenu(): void {
    if (this.isOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  logout(): void {
    this.closeMenu();
    this.authStore.logout();
    this.router.navigate(['/connexion']);
  }

  // ✅ Écouter la touche Échap pour fermer le menu
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.closeMenu();
    }
  }
}