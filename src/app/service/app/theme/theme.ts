// src/app/services/theme.ts

import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type BilankoTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'bilanko-theme';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal exposé publiquement
  readonly theme = signal<BilankoTheme>(this.getInitialTheme());

  constructor() {
    // Effet pour synchroniser le DOM et le localStorage
    effect(() => {
      if (!this.isBrowser) return;
      const currentTheme = this.theme();
      
      // Synchroniser les attributs pour les variables CSS et Bootstrap
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.documentElement.setAttribute('data-bs-theme', currentTheme);
      
      // ⚠️ CRUCIAL : Ne sauvegarder en localStorage que si on est sur une page connectée
      // Et ne pas sauvegarder si le thème vient du système (pour ne pas écraser les préférences)
      if (!this.isLandingPage()) {
        localStorage.setItem(this.storageKey, currentTheme);
      }
    });
  }

  /**
   * Détecte le thème du système (préférence du navigateur)
   */
  getSystemTheme(): BilankoTheme {
    if (!this.isBrowser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Vérifie si on est sur la landing page (publique)
   * La landing page est la racine ou la page d'accueil
   */
  private isLandingPage(): boolean {
    if (!this.isBrowser) return false;
    const path = window.location.pathname;
    // ✅ Inclure aussi les pages d'authentification qui sont publiques
    const publicPages = ['/', '/connexion', '/inscription', '/mot-de-passe-oublie'];
    return publicPages.includes(path) || path === '';
  }

  /**
   * Initialise le thème en fonction du contexte
   */
  private getInitialTheme(): BilankoTheme {
    if (!this.isBrowser) return 'light';

    // Sur la landing page → on utilise le thème du système
    if (this.isLandingPage()) {
      return this.getSystemTheme();
    }

    // Sur les pages connectées → on charge depuis localStorage
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') return saved;

    // Fallback : thème du système
    return this.getSystemTheme();
  }

  /**
   * Force l'utilisation du thème système (pour la landing page)
   * Cette méthode est appelée par le composant Landing
   */
  setThemeFromSystem(): void {
    this.theme.set(this.getSystemTheme());
  }

  /**
   * 🔥 NOUVEAU : Recharger le thème depuis localStorage
   * À appeler après la connexion pour charger les préférences de l'utilisateur
   */
  loadUserTheme(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') {
      this.theme.set(saved);
    } else {
      this.theme.set(this.getSystemTheme());
    }
  }

  /**
   * Bascule entre clair et sombre
   */
  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }
}