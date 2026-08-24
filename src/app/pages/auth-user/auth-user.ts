import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme';
import { PreferencesService } from '../../services/preferences';

@Component({
  selector: 'app-auth-user',
  standalone: true,
  imports: [],
  templateUrl: './auth-user.html',
  styleUrl: './auth-user.css',
})
export class AuthUser {
  protected readonly themeService = inject(ThemeService);
  protected readonly prefs = inject(PreferencesService);
}