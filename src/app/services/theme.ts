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
    effect(() => {
      if (!this.isBrowser) return;
      const currentTheme = this.theme();
      
      // Synchronise tes variables personnalisées ET Bootstrap
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.documentElement.setAttribute('data-bs-theme', currentTheme);
      
      localStorage.setItem(this.storageKey, currentTheme);
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): BilankoTheme {
    if (!this.isBrowser) return 'light';

    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}