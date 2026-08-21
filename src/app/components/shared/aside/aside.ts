// src/app/components/shared/aside/aside.ts
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-aside',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrls: ['./aside.css'],
})
export class Aside {
  private readonly router = inject(Router);
  protected readonly prefs = inject(PreferencesService);

  logout(): void {
    this.router.navigate(['/connexion']);
  }
}