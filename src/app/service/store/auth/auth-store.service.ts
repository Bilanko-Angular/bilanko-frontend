// src/app/service/store/auth/auth-store.service.ts

import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthApiService } from '../../api/auth/auth-api.service';
import { User } from '../../../models/person';
import { UserStoreService } from '../user/user-store.service';
import { ThemeService } from '../../../services/theme'; // ← AJOUTER

@Injectable({
  providedIn: 'root',
})
export class AuthStoreService {
  private authApiService = inject(AuthApiService);
  private platformId = inject(PLATFORM_ID);
  private userStore = inject(UserStoreService);
  private themeService = inject(ThemeService); // ← AJOUTER
  private readonly TOKEN_KEY = 'bilanko_jwt_token';

  private tokenSignal = signal<string | null>(this.getInitialToken());

  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  async register(userData: User): Promise<void> {
    try {
      const response = await this.authApiService.register(userData);
      if (response?.token) {
        this.saveToken(response.token);
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error);
      throw error;
    }
  }

  async login(userData: User): Promise<void> {
    try {
      const response = await this.authApiService.login(userData);
      if (response?.token) {
        this.saveToken(response.token);
        // 🔥 Charger le thème de l'utilisateur après connexion
        this.themeService.loadUserTheme();
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      throw error;
    }
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.tokenSignal.set(token);
    this.userStore.loadUser();
    // 🔥 Charger le thème de l'utilisateur
    this.themeService.loadUserTheme();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.tokenSignal.set(null);
    this.userStore.clearUser();
  }

  private getInitialToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  async loginWithGoogle(idToken: string): Promise<void> {
    try {
      const response = await this.authApiService.loginWithGoogle(idToken);
      if (response?.token) {
        this.saveToken(response.token);
        this.themeService.loadUserTheme();
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google :', error);
      throw error;
    }
  }
}