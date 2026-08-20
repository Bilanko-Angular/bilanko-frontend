import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aside',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrls: ['./aside.css'],
})
export class Aside {
  private readonly router = inject(Router);

  logout(): void {
    this.router.navigate(['/connexion']);
  }
}