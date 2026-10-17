// src/app/components/shared/header/header.ts

import {
  Component,
  inject,
  signal,
  ElementRef,
  HostListener,
  output,
  effect
} from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../../service/app/theme/theme';
import { PreferencesService } from '../../../service/app/preference/preferences';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { NotificationsBell } from './notifications-bell/notifications-bell';
import { UpperCasePipe } from '@angular/common';
import {SearchHeader} from './search-header/search-header';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NotificationsBell, UpperCasePipe, SearchHeader],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  readonly menuToggle = output<void>();
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  protected readonly prefs = inject(PreferencesService);
  protected readonly userStore = inject(UserStoreService);

  readonly profileImageError = signal(false);

  readonly searchPopupOpen = signal(false);

  openSearchPopup(): void {
    this.searchPopupOpen.set(true);
    // Focus sur l'input après l'ouverture
    setTimeout(() => {
      const input = document.querySelector('.bk-search-popup__input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  closeSearchPopup(): void {
    this.searchPopupOpen.set(false);
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  // ============================================================
  // PROFIL
  // ============================================================

  readonly profileOpen = signal(false);

  toggleProfile(): void {
    this.profileOpen.update((v) => !v);
  }

  logout(): void {
    this.profileOpen.set(false);
    this.router.navigate(['/connexion']);
  }

  // ============================================================
  // FERMETURE AU CLIC EXTÉRIEUR
  // ============================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.profileOpen.set(false);
      // Ne pas fermer le popup automatiquement, l'utilisateur doit cliquer sur la croix ou le backdrop
    }
  }

  // ✅ FERMER LE POPUP AVEC ÉCHAP
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.searchPopupOpen()) {
      this.closeSearchPopup();
    }
  }

  // ============================================================
  // TITRE DE PAGE
  // ============================================================

  get pageTitle(): string {
    const url = this.router.url;
    if (url.startsWith('/catalogue')) return 'Catalogue & Stocks';
    if (url.startsWith('/ventes')) return 'Gestion des ventes';
    if (url.startsWith('/charges')) return 'Gestion des charges';
    if (url.startsWith('/documents')) return 'Documents';
    return 'Tableau de bord';
  }

  get breadcrumbCurrent(): string {
    const url = this.router.url;
    if (url.startsWith('/catalogue')) return 'Catalogue';
    if (url.startsWith('/ventes')) return 'Ventes';
    if (url.startsWith('/charges')) return 'Charges';
    if (url.startsWith('/documents')) return 'Documents';
    return 'Accueil';
  }
  onImageError(event: Event) {
    console.error('Erreur de chargement image:', event);
    console.log('URL tentée:', (event.target as HTMLImageElement).src);
    this.profileImageError.set(true);
  }

  constructor() {
    effect(() => {
      this.userStore.user()?.profilePicture;
      this.profileImageError.set(false);
    });
  }
}
