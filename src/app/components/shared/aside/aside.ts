import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../services/preferences';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { AuthStoreService } from '../../../service/store/auth/auth-store.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-aside',
  imports: [RouterLink, RouterLinkActive,UpperCasePipe],
  templateUrl: './aside.html',
  styleUrls: ['./aside.css'],
})
export class Aside {
  private readonly router = inject(Router);
  protected readonly prefs = inject(PreferencesService);
  protected readonly userStore = inject(UserStoreService);
  protected readonly authStore = inject(AuthStoreService);

  readonly profileImageError = signal(false);

  constructor() {
    effect(() => {
      this.userStore.user()?.profilePicture; // dépendance
      this.profileImageError.set(false);
    }, { allowSignalWrites: true });
  }
  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/connexion']);
  }
}