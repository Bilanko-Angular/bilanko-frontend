// src/app/pages/auth-user/auth-user.ts
import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-auth-user',
  standalone: true,
  imports: [],
  templateUrl: './auth-user.html',
  styleUrl: './auth-user.css',
})
export class AuthUser {
  protected readonly themeService = inject(ThemeService);
}