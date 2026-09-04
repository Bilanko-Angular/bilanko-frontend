// src/app/pages/landing/components/landing-navbar/landing-navbar.ts

import { Component, inject, signal, HostListener, PLATFORM_ID, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../../services/theme';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-navbar.html',
  styleUrls: ['./landing-navbar.css']
})
export class LandingNavbar implements OnInit {
  readonly themeService = inject(ThemeService);
  private readonly platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // ✅ Signal pour la section active
  readonly activeSection = signal<string>('');

  // ✅ IDs des sections (doivent correspondre EXACTEMENT aux IDs dans landing.html)
  private readonly sectionIds = ['fonctionnalites', 'comment-ca-marche', 'pourquoi-bilanko'];

  // ✅ Définir la section active par défaut sur 'fonctionnalites' si on est en haut
  ngOnInit(): void {
    // Petite attente pour que le DOM soit prêt
    setTimeout(() => {
      this.checkActiveSection();
    }, 100);
  }

  // ✅ Scroll fluide vers une section
  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    
    if (!this.isBrowser) return;
    
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Hauteur de la navbar + marge
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Mettre à jour la section active immédiatement
      this.activeSection.set(sectionId);
    }
  }

  // ✅ Vérifier quelle section est active
  private checkActiveSection(): void {
    if (!this.isBrowser) return;

    const scrollPosition = window.scrollY + 120; // Marge pour la navbar

    // Vérifier si on est en haut de la page (avant la première section)
    if (scrollPosition < 200) {
      this.activeSection.set('');
      return;
    }

    // Parcourir les sections de bas en haut pour trouver celle qui est active
    for (let i = this.sectionIds.length - 1; i >= 0; i--) {
      const id = this.sectionIds[i];
      const element = document.getElementById(id);
      if (element) {
        const offsetTop = element.offsetTop - 80;
        if (scrollPosition >= offsetTop) {
          this.activeSection.set(id);
          return;
        }
      }
    }
  }

  // ✅ Détecter la section active au scroll
  @HostListener('window:scroll')
  onScroll(): void {
    this.checkActiveSection();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }
}