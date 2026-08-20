

import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type BilankoTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'bilanko-theme';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<BilankoTheme>(this.getInitialTheme());

  constructor() {
    // À chaque changement du signal, on répercute sur le DOM + on sauvegarde.
    effect(() => {
      if (!this.isBrowser) return;
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem(this.storageKey, this.theme());
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): BilankoTheme {
    // Pendant le rendu SSR (server.ts), window/localStorage n'existent pas.
    if (!this.isBrowser) return 'light';

    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}