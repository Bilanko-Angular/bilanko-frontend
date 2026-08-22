import { Injectable, signal } from '@angular/core';
import { ProductApiService } from '../../api/product/product-api.service';
import { Produit } from '../../../models/produit';
import { RechercheParams } from '../../../models/shared/RechercheParams';
import { CreateProduitPayload, UpdateProduitPayload } from '../../../models/DTO/payload/ProductPayload';



@Injectable({
  providedIn: 'root',
})
export class ProduitStoreService {
  private readonly productApi = new ProductApiService(); // ou inject() si tu restes en DI standard

  readonly produits = signal<Produit[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly pageCourante = signal(0); // 0-indexée, alignée sur Spring Data

  private dernierParams: RechercheParams = {};

  async rechercher(params: RechercheParams): Promise<void> {
    this.dernierParams = params;
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.productApi.search({
        search: params.search,
        categoryId: params.categoryId,
        stockStatus: params.stockStatus,
        page: params.page ?? 0,
        size: 10,
      });
      this.produits.set(result.produits);
      this.totalElements.set(result.totalElements);
      this.totalPages.set(result.totalPages);
      this.pageCourante.set(result.page);
    } catch (e) {
      console.error('Erreur recherche produits :', e);
      this.error.set('Impossible de charger les produits');
    } finally {
      this.isLoading.set(false);
    }
  }

  allerAPage(page: number): void {
    this.pageCourante.set(page);
  }

  async ajouter(payload: CreateProduitPayload): Promise<void> {
    await this.productApi.create(payload);
    await this.rechercher({ ...this.dernierParams, page: 0 });
  }

  async modifier(id: string, payload: UpdateProduitPayload): Promise<void> {
    await this.productApi.update(id, payload);
    await this.rechercher(this.dernierParams);
  }

  async supprimer(id: string): Promise<void> {
    await this.productApi.delete(id);
    await this.rechercher(this.dernierParams);
  }
}