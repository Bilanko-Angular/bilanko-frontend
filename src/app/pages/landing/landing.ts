// src/app/pages/landing/landing.component.ts
import { LandingNavbar } from './components/landing-navbar/landing-navbar';
import { LandingHero } from './components/landing-hero/landing-hero';
import { LandingFeatures } from './components/landing-features/landing-features';
import { LandingWhy } from './components/landing-why/landing-why';
import { LandingSteps } from './components/landing-steps/landing-steps';
import { LandingCta } from './components/landing-cta/landing-cta';
import { LandingFooter } from './components/landing-footer/landing-footer';
import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme';
import { PreferencesService } from '../../services/preferences';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    LandingNavbar,
    LandingHero,
    LandingFeatures,
    LandingWhy,
    LandingSteps,
    LandingCta,
    LandingFooter
  ],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly prefsService = inject(PreferencesService);

  ngOnInit(): void {
    // Forcer la détection basée sur le système pour la landing page
    this.themeService.setThemeFromSystem();
    this.prefsService.setLanguageFromSystem();
  }
}