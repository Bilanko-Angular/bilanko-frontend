import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeService } from '../../../services/theme';
import { SalesService } from '../../../services/sales.service';
import { ChargesService } from '../../../services/charges.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {

  protected themeService = inject(ThemeService);

  private router = inject(Router);
  private salesService = inject(SalesService);
  private chargesService = inject(ChargesService);

  // Texte tapé dans la recherche
  searchTerm = signal('');

  // Résultats de recherche
  searchResults = computed(() => {

    const term = this.searchTerm()
      .trim()
      .toLowerCase();

    if (!term) {
      return [];
    }

    const ventes = this.salesService.sales()
      .filter(vente =>
        vente.product.toLowerCase().includes(term) ||
        (vente.client ?? '').toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(vente => ({
        type: 'Vente',
        title: vente.product,
        detail: `${vente.totalAmount.toLocaleString('fr-FR')} FCFA`,
        route: '/ventes'
      }));

    const charges = this.chargesService.charges()
      .filter(charge =>
        charge.label.toLowerCase().includes(term) ||
        (charge.category ?? '').toLowerCase().includes(term) ||
        (charge.supplier ?? '').toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(charge => ({
        type: 'Charge',
        title: charge.label,
        detail: `${charge.amount.toLocaleString('fr-FR')} FCFA`,
        route: '/charges'
      }));

    return [...ventes, ...charges].slice(0, 8);
  });


  // Appelé quand l'utilisateur écrit
  onSearch(event: Event) {

    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }


  // Cliquer sur un résultat
  openResult(route: string) {

    this.searchTerm.set('');

    this.router.navigate([route]);
  }


  // Effacer la recherche
  clearSearch() {

    this.searchTerm.set('');
  }
}