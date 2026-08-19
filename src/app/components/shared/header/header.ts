import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { Router } from '@angular/router';

import { ThemeService } from '../../../services/theme';
import { ProduitService } from '../../../services/produit.service';
import { SalesService } from '../../../services/sales.service';

import type { Produit } from '../../../models/produit';
import type { Sale } from '../../../models/finance';


interface SearchResult {
  type: 'produit' | 'vente';
  id: string;
  title: string;
  subtitle: string;
  produit?: Produit;
  vente?: Sale;
}


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  protected readonly themeService = inject(ThemeService);

  private readonly router = inject(Router);

  private readonly produitService =
    inject(ProduitService);

  private readonly salesService =
    inject(SalesService);


  // ============================================================
  // RECHERCHE
  // ============================================================

  readonly searchTerm = signal('');


  readonly produits =
    this.produitService.catalogue;


  readonly ventes =
    this.salesService.sales;


  /**
   * Résultats de recherche.
   *
   * On cherche dans :
   * - les produits
   * - les ventes
   *
   * Cela permet par exemple de retrouver "riz"
   * même si "riz" existe actuellement dans les ventes.
   */
  readonly searchResults = computed<SearchResult[]>(() => {

    const terme = this.searchTerm()
      .trim()
      .toLowerCase();


    if (!terme) {
      return [];
    }


    const results: SearchResult[] = [];


    // ------------------------------------------------------------
    // PRODUITS
    // ------------------------------------------------------------

    const produits =
      this.produits.hasValue()
        ? this.produits.value()
        : [];


    for (const produit of produits) {

      const correspond =
        produit.nom.toLowerCase().includes(terme) ||
        produit.reference.toLowerCase().includes(terme) ||
        produit.categorie.toLowerCase().includes(terme);


      if (correspond) {

        results.push({
          type: 'produit',
          id: produit.id,
          title: produit.nom,
          subtitle:
            `${produit.reference} · ${produit.categorie}`,
          produit
        });

      }

    }


    // ------------------------------------------------------------
    // VENTES
    // ------------------------------------------------------------

    for (const vente of this.ventes()) {

      const correspond =
        vente.product.toLowerCase().includes(terme) ||
        (vente.client ?? '')
          .toLowerCase()
          .includes(terme);


      if (correspond) {

        results.push({
          type: 'vente',
          id: vente.id,
          title: vente.product,
          subtitle:
            `Vente · ${vente.client || 'Client comptant'}`,
          vente
        });

      }

    }


    return results.slice(0, 8);

  });


  // ============================================================
  // RECHERCHE
  // ============================================================

  onSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);

  }


  clearSearch(): void {

    this.searchTerm.set('');

  }


  onSearchKeydown(event: KeyboardEvent): void {

    if (event.key === 'Enter') {

      const premier =
        this.searchResults()[0];

      if (premier) {
        this.openResult(premier);
      }

    }

  }


  // ============================================================
  // OUVERTURE D'UN RESULTAT
  // ============================================================

  openResult(result: SearchResult): void {

    this.searchTerm.set('');


    if (result.type === 'produit') {

      this.router.navigate([
        '/catalogue'
      ]);

      return;

    }


    if (result.type === 'vente') {

      this.router.navigate([
        '/ventes'
      ]);

    }

  }


  // ============================================================
  // OUVRIR LE CATALOGUE
  // ============================================================

  openCatalogue(): void {

    this.clearSearch();

    this.router.navigate([
      '/catalogue'
    ]);

  }


  // ============================================================
  // TITRE DE PAGE
  // ============================================================

  get pageTitle(): string {

    const url =
      this.router.url;


    if (url.startsWith('/catalogue')) {
      return 'Catalogue & Stocks';
    }

    if (url.startsWith('/ventes')) {
      return 'Gestion des ventes';
    }

    if (url.startsWith('/charges')) {
      return 'Gestion des charges';
    }

    if (url.startsWith('/documents')) {
      return 'Documents';
    }

    return 'Tableau de bord';

  }


  get breadcrumbCurrent(): string {

    const url =
      this.router.url;


    if (url.startsWith('/catalogue')) {
      return 'Catalogue';
    }

    if (url.startsWith('/ventes')) {
      return 'Ventes';
    }

    if (url.startsWith('/charges')) {
      return 'Charges';
    }

    if (url.startsWith('/documents')) {
      return 'Documents';
    }

    return 'Accueil';

  }

}