// src/app/pages/landing/components/landing-navbar/landing-navbar.ts
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../services/theme';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-navbar.html',
  styleUrls: ['./landing-navbar.css']
})
export class LandingNavbar {
  readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggle();
  }

  get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }
}