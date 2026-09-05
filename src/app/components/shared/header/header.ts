// src/app/components/shared/header/header.ts

import {
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  HostListener,
  output,
  viewChild,  // ✅ AJOUTÉ
  effect
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
  imports: [NotificationsBell, UpperCasePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  readonly menuToggle = output<void>();
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly produitStore = inject(ProduitStoreService);
  private readonly salesService = inject(SalesService);
  protected readonly prefs = inject(PreferencesService);
  protected readonly userStore = inject(UserStoreService);

  readonly profileImageError = signal(false);
  readonly searchTerm = signal('');
  
  // ✅ NOUVEAU : Popup de recherche
  readonly searchPopupOpen = signal(false);

  readonly ventes = this.salesService.sales;

  readonly searchResults = computed<SearchResult[]>(() => {
    const terme = this.searchTerm().trim().toLowerCase();
    if (!terme) return [];

    const results: SearchResult[] = [];
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

  // ✅ OUVRE LE POPUP DE RECHERCHE
  openSearchPopup(): void {
    this.searchPopupOpen.set(true);
    // Focus sur l'input après l'ouverture
    setTimeout(() => {
      const input = document.querySelector('.bk-search-popup__input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  // ✅ FERME LE POPUP DE RECHERCHE
  closeSearchPopup(): void {
    this.searchPopupOpen.set(false);
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

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
        this.closeSearchPopup();
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
  // FERMETURE AU CLIC EXTÉRIEUR
  // ============================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.profileOpen.set(false);
      // Ne pas fermer le popup automatiquement, l'utilisateur doit cliquer sur la croix ou le backdrop
    }
  }

  // ✅ FERMER LE POPUP AVEC ÉCHAP
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.searchPopupOpen()) {
      this.closeSearchPopup();
    }
  }

  // ============================================================
  // TITRE DE PAGE
  // ============================================================

  get pageTitle(): string {
    const url = this.router.url;
    if (url.startsWith('/catalogue')) return 'Catalogue & Stocks';
    if (url.startsWith('/ventes')) return 'Gestion des ventes';
    if (url.startsWith('/charges')) return 'Gestion des charges';
    if (url.startsWith('/documents')) return 'Documents';
    return 'Tableau de bord';
  }

  get breadcrumbCurrent(): string {
    const url = this.router.url;
    if (url.startsWith('/catalogue')) return 'Catalogue';
    if (url.startsWith('/ventes')) return 'Ventes';
    if (url.startsWith('/charges')) return 'Charges';
    if (url.startsWith('/documents')) return 'Documents';
    return 'Accueil';
  }
  onImageError(event: Event) {
    console.error('Erreur de chargement image:', event);
    console.log('URL tentée:', (event.target as HTMLImageElement).src);
    this.profileImageError.set(true);
  }

  constructor() {
    effect(() => {
      this.userStore.user()?.profilePicture;
      this.profileImageError.set(false);
    });
  }
}