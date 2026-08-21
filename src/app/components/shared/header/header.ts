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
import { ProduitService } from '../../../services/produit.service';
import { SalesService } from '../../../services/sales.service';

import type { Produit } from '../../../models/produit';
import { PreferencesService } from '../../../services/preferences';
import type { Sale } from '../../../models/finance';


interface SearchResult {
  type: 'produit' | 'vente';
  id: string;
  title: string;
  subtitle: string;
  produit?: Produit;
  vente?: Sale;
}

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'stock' | 'vente' | 'systeme';
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
  private readonly elementRef = inject(ElementRef);

  private readonly produitService =
    inject(ProduitService);

  private readonly salesService =
    inject(SalesService);

   protected readonly prefs = inject(PreferencesService);


  // ============================================================
  // RECHERCHE
  // ============================================================

  readonly searchTerm = signal('');


  readonly produits =
    this.produitService.catalogue;


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


    const produits =
      this.produits.value()
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
  // NOTIFICATIONS
  // ============================================================

  readonly notificationsOpen = signal(false);

  readonly notifications = signal<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Stock faible',
      detail: 'Sucre 1kg atteint le seuil d\'alerte',
      time: 'Il y a 2h',
      type: 'stock'
    },
    {
      id: 'n2',
      title: 'Nouvelle vente',
      detail: 'Vente enregistrée pour Restaurant Le Palo',
      time: 'Il y a 5h',
      type: 'vente'
    },
    {
      id: 'n3',
      title: 'Mise à jour',
      detail: 'Le catalogue a été synchronisé',
      time: 'Hier',
      type: 'systeme'
    }
  ]);

  readonly notificationsCount = computed(
    () => this.notifications().length
  );

  toggleNotifications(): void {
    this.notificationsOpen.update((v) => !v);
    this.profileOpen.set(false);
  }

  goToNotificationTarget(notif: NotificationItem): void {
    this.notificationsOpen.set(false);
    if (notif.type === 'stock') {
      this.router.navigate(['/catalogue']);
    } else if (notif.type === 'vente') {
      this.router.navigate(['/ventes']);
    }
  }

  clearNotifications(): void {
    this.notifications.set([]);
    this.notificationsOpen.set(false);
  }


  // ============================================================
  // PROFIL
  // ============================================================

  readonly profileOpen = signal(false);

  toggleProfile(): void {
    this.profileOpen.update((v) => !v);
    this.notificationsOpen.set(false);
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
      this.notificationsOpen.set(false);
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