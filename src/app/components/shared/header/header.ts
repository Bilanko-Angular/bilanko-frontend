import {
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  HostListener
} from '@angular/core';

import { Router } from '@angular/router';

import { ThemeService } from '../../../services/theme';
import { SalesService } from '../../../services/sales.service';

import type { Produit } from '../../../models/produit';
import { PreferencesService } from '../../../services/preferences';
import type { Sale } from '../../../models/sale';
import { ProduitStoreService } from '../../../service/store/product/produit-store.service';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { NotificationsBell } from './notifications-bell/notifications-bell';
import { UpperCasePipe } from '@angular/common';



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
  imports: [NotificationsBell,UpperCasePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  protected readonly themeService = inject(ThemeService);

  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  private readonly produitStore =
    inject(ProduitStoreService);

  private readonly salesService =
    inject(SalesService);

  protected readonly prefs = inject(PreferencesService);
  protected readonly userStore = inject(UserStoreService);

  readonly profileImageError = signal(false);

  readonly searchTerm = signal('');

  readonly ventes =
    this.salesService.sales;


  readonly searchResults = computed<SearchResult[]>(() => {

    const terme = this.searchTerm()
      .trim()
      .toLowerCase();

    if (!terme) {
      return [];
    }

    const results: SearchResult[] = [];

    // produits est déjà un signal de tableau, pas besoin de .value()
    const produits = this.produitStore.produits() ?? [];

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
          subtitle: `${produit.reference} · ${produit.categorie}`,
          produit
        });
      }
    }

    for (const vente of this.ventes()) {
      const produitNom = vente.product || (vente.items && vente.items.length > 0 ? vente.items[0].productName : 'Vente');
      const clientNom = vente.client || vente.customerName || 'Client comptant';
      const correspond =
        produitNom.toLowerCase().includes(terme) ||
        clientNom.toLowerCase().includes(terme);

      if (correspond) {
        results.push({
          type: 'vente',
          id: vente.id,
          title: produitNom,
          subtitle: `Vente · ${clientNom}`,
          vente
        });
      }
    }

    return results.slice(0, 8);
  });



  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }


  clearSearch(): void {
    this.searchTerm.set('');
  }


  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const premier = this.searchResults()[0];
      if (premier) {
        this.openResult(premier);
      }
    }
  }


  openResult(result: SearchResult): void {

    this.searchTerm.set('');

    if (result.type === 'produit') {
      this.router.navigate(['/catalogue']);
      return;
    }

    if (result.type === 'vente') {
      this.router.navigate(['/ventes']);
    }

  }


  openCatalogue(): void {
    this.clearSearch();
    this.router.navigate(['/catalogue']);
  }


  // ============================================================
  // PROFIL
  // ============================================================

  readonly profileOpen = signal(false);

  toggleProfile(): void {
    this.profileOpen.update((v) => !v);
  }

  logout(): void {
    this.profileOpen.set(false);
    this.router.navigate(['/connexion']);
  }


  // ============================================================
  // FERMETURE AU CLIC EXTÉRIEUR (profil uniquement — les
  // notifications gèrent leur propre fermeture dans NotificationsBell)
  // ============================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.profileOpen.set(false);
    }
  }


  // ============================================================
  // TITRE DE PAGE
  // ============================================================

  get pageTitle(): string {

    const url = this.router.url;

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

    const url = this.router.url;

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