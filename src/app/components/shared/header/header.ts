// ============================================================
// MODIF À FAIRE DANS : src/app/components/shared/header/header.ts
// ============================================================
// C'est un fichier PARTAGÉ par toute l'équipe : préviens la personne
// qui l'a créé avant de le modifier, pour éviter un conflit Git.
// Le changement est petit et sûr : on AJOUTE seulement, on ne casse rien.

import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  // Rendu public (pas "private") pour que le template header.html
  // puisse l'utiliser directement.
  protected themeService = inject(ThemeService);
}