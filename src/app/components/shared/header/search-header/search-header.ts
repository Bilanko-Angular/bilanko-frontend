import {Component, computed, inject, input, model, output, signal} from '@angular/core';
import {PreferencesService} from '../../../../service/app/preference/preferences';
import type {Produit} from '../../../../models/produit';
import type {Sale} from '../../../../models/sale';
import {ProduitStoreService} from '../../../../service/store/product/produit-store.service';
import {Router} from '@angular/router';

interface SearchResult {
  type: 'produit' | 'vente';
  id: string;
  title: string;
  subtitle: string;
  produit?: Produit;
  vente?: Sale;
}

@Component({
  selector: 'app-search-header',
  imports: [],
  templateUrl: './search-header.html',
  styleUrl: './search-header.css',
})
export class SearchHeader {
  protected readonly prefs = inject(PreferencesService);
  readonly searchTerm = signal('');
  searchPopupOpen = model(false);
  private readonly produitStore = inject(ProduitStoreService);
  private readonly router = inject(Router);

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  // ✅ FERME LE POPUP DE RECHERCHE


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


    return results.slice(0, 8);
  });

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
}
