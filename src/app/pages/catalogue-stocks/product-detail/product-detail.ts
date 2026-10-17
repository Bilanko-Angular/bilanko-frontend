import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Template } from '../../../components/shared/template/template';
import { PreferencesService } from '../../../service/app/preference/preferences';
import { ProductApiService } from '../../../service/api/product/product-api.service';
import type { ProductApiDto } from '../../../models/DTO/ProductDto';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [Template, CurrencyPipe, DatePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApiService);
  protected readonly prefs = inject(PreferencesService);

  readonly product = signal<ProductApiDto | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.loadProduct();
  }

  private async loadProduct(): Promise<void> {
    const reference = this.route.snapshot.paramMap.get('ref');
    if (!reference) {
      this.error.set('Produit introuvable.');
      this.isLoading.set(false);
      return;
    }

    try {
      const products = await this.productApi.getMineDetails();
      const product = products.find((item) => item.reference === reference);
      if (!product) this.error.set('Produit introuvable.');
      this.product.set(product);
    } catch (err) {
      console.error('Erreur chargement détail produit :', err);
      this.error.set('Impossible de charger ce produit.');
    } finally {
      this.isLoading.set(false);
    }
  }

  retour(): void {
    void this.router.navigate(['/catalogue']);
  }
}
