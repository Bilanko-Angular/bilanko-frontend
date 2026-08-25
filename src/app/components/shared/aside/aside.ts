import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../services/preferences';
import { UserStoreService } from '../../../service/store/user/user-store.service';
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

  readonly profileImageError = signal(false);


  logout(): void {
    this.router.navigate(['/connexion']);
  }
}