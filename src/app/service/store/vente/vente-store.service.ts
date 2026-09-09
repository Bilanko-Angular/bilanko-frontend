import { Injectable, signal, computed, inject } from '@angular/core';
import { VenteApiService } from '../../api/vente/vente-api.service';
import { SaleMapper } from '../../../mapper/SaleMapper';
import type { Sale } from '../../../models/sale';
import type { SaleSummaryDTO } from '../../../models/DTO/SaleDto';

@Injectable({
  providedIn: 'root',
})
export class VenteStoreService {
  private readonly venteApi = inject(VenteApiService);

  private readonly _sales = signal<Sale[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly summary = signal<SaleSummaryDTO | null>(null);

  /** Terme de recherche (lié à l'endpoint /search) */
  readonly searchTerm = signal('');

  /** Date filtrée (YYYY-MM-DD) — convertie en from/to pour le backend */
  readonly filterDate = signal('');

  readonly sales = this._sales.asReadonly();

  /** Liste affichée : déjà filtrée côté API selon search / date */
  readonly filteredSales = computed(() => this._sales());

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadAll();
  }

  // ──────────────────────────────────────────
  // Lecture
  // ──────────────────────────────────────────

  async loadAll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const date = this.filterDate();
      const { from, to } = this.toDateRange(date);
      const dtos = await this.venteApi.getAllSales(from, to);
      this._sales.set(SaleMapper.fromResponseDTOList(dtos));
    } catch (err) {
      console.error('VenteStore: erreur lors du chargement', err);
      this.error.set('Impossible de charger les ventes.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadSummary(from?: string, to?: string): Promise<void> {
    try {
      this.summary.set(await this.venteApi.getSummary(from, to));
    } catch (err) {
      console.error('VenteStore: erreur résumé', err);
    }
  }

  async getById(id: string): Promise<Sale | undefined> {
    const local = this._sales().find((s) => s.id === id);
    if (local) return local;

    try {
      const dto = await this.venteApi.getSaleById(Number(id));
      const sale = SaleMapper.fromResponseDTO(dto);
      this._sales.update((list) => {
        if (list.some((s) => s.id === sale.id)) return list;
        return [...list, sale];
      });
      return sale;
    } catch (err) {
      console.error('VenteStore: erreur getById', err);
      this.error.set('Impossible de charger cette vente.');
      return undefined;
    }
  }

  findById(id: string): Sale | undefined {
    return this._sales().find((s) => s.id === id);
  }

  // ──────────────────────────────────────────
  // Recherche & filtres
  // ──────────────────────────────────────────

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      void this.applyFilters();
    }, 300);
  }

  setFilterDate(date: string): void {
    this.filterDate.set(date);
    void this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterDate.set('');
    void this.loadAll();
  }

  private async applyFilters(): Promise<void> {
    const term = this.searchTerm().trim();
    const date = this.filterDate();

    // Recherche texte prioritaire via l'endpoint dédié
    if (term) {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        let dtos = await this.venteApi.searchSales(term);
        if (date) {
          dtos = dtos.filter((s) => s.saleDate.startsWith(date));
        }
        this._sales.set(SaleMapper.fromResponseDTOList(dtos));
      } catch (err) {
        console.error('VenteStore: erreur recherche', err);
        this.error.set('Impossible de rechercher les ventes.');
      } finally {
        this.isLoading.set(false);
      }
      return;
    }

    await this.loadAll();
  }

  private toDateRange(date: string): { from?: string; to?: string } {
    if (!date) return {};
    // Début et fin de journée en ISO LocalDateTime
    return {
      from: `${date}T00:00:00`,
      to: `${date}T23:59:59`,
    };
  }

  // ──────────────────────────────────────────
  // CRUD
  // ──────────────────────────────────────────

  async add(sale: Omit<Sale, 'id'>): Promise<void> {
    const dto = SaleMapper.toRequestDTO(sale);
    try {
      const created = await this.venteApi.createSale(dto);
      this._sales.update((list) => [SaleMapper.fromResponseDTO(created), ...list]);
    } catch (err) {
      console.error('VenteStore: erreur création', err);
      this.error.set('Impossible de créer la vente.');
      throw err;
    }
  }

  async update(id: string, sale: Omit<Sale, 'id'>): Promise<void> {
    const dto = SaleMapper.toRequestDTO(sale);
    try {
      const updated = await this.venteApi.updateSale(Number(id), dto);
      this._sales.update((list) =>
        list.map((s) => (s.id === id ? SaleMapper.fromResponseDTO(updated) : s))
      );
    } catch (err) {
      console.error('VenteStore: erreur mise à jour', err);
      this.error.set('Impossible de mettre à jour la vente.');
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.venteApi.deleteSale(Number(id));
      this._sales.update((list) => list.filter((s) => s.id !== id));
    } catch (err) {
      console.error('VenteStore: erreur suppression', err);
      this.error.set('Impossible de supprimer la vente.');
      throw err;
    }
  }
}
