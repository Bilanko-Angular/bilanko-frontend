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

  // ──────────────────────────────────────────
  // État paginé (serveur)
  // ──────────────────────────────────────────

  private readonly _sales = signal<Sale[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly summary = signal<SaleSummaryDTO | null>(null);

  /** Page courante (0-indexée pour l'API, exposée en 1-indexée pour la vue) */
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  /** Terme de recherche (lié à l'endpoint /search) */
  readonly searchTerm = signal('');

  /** Date filtrée (YYYY-MM-DD) — convertie en from/to pour le backend */
  readonly filterDate = signal('');

  readonly sales = this._sales.asReadonly();

  /** Page affichée (1-indexée pour le template) */
  readonly pageCourante = computed(() => this.currentPage() + 1);

  /** Alias de compatibilité : la liste de la page actuelle */
  readonly filteredSales = computed(() => this._sales());

  readonly nombrePages = computed(() => this.totalPages());

  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
  readonly hasPrevPage = computed(() => this.currentPage() > 0);

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
      const page = await this.venteApi.getAllSales(from, to, this.currentPage(), this.pageSize());
      this._sales.set(SaleMapper.fromResponseDTOList(page.content));
      this.totalElements.set(page.totalElements);
      this.totalPages.set(page.totalPages);
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
  // Navigation de page
  // ──────────────────────────────────────────

  goToPage(page: number): void {
    const clamped = Math.max(0, Math.min(page, this.totalPages() - 1));
    this.currentPage.set(clamped);
    void this.applyFilters();
  }

  pageSuivante(): void {
    if (this.hasNextPage()) this.goToPage(this.currentPage() + 1);
  }

  pagePrecedente(): void {
    if (this.hasPrevPage()) this.goToPage(this.currentPage() - 1);
  }

  // ──────────────────────────────────────────
  // Recherche & filtres
  // ──────────────────────────────────────────

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage.set(0);
      void this.applyFilters();
    }, 300);
  }

  setFilterDate(date: string): void {
    this.filterDate.set(date);
    this.currentPage.set(0);
    void this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterDate.set('');
    this.currentPage.set(0);
    void this.loadAll();
  }

  private async applyFilters(): Promise<void> {
    const term = this.searchTerm().trim();

    if (term) {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        const page = await this.venteApi.searchSales(term, this.currentPage(), this.pageSize());
        this._sales.set(SaleMapper.fromResponseDTOList(page.content));
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
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
      await this.venteApi.createSale(dto);
      // Recharger la page 0 pour voir la nouvelle vente en tête
      this.currentPage.set(0);
      await this.applyFilters();
    } catch (err) {
      console.error('VenteStore: erreur création', err);
      this.error.set('Impossible de créer la vente.');
      throw err;
    }
  }

  async update(id: string, sale: Omit<Sale, 'id'>): Promise<void> {
    const dto = SaleMapper.toRequestDTO(sale);
    try {
      await this.venteApi.updateSale(Number(id), dto);
      // Recharger la page courante pour refléter la mise à jour
      await this.applyFilters();
    } catch (err) {
      console.error('VenteStore: erreur mise à jour', err);
      this.error.set('Impossible de mettre à jour la vente.');
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.venteApi.deleteSale(Number(id));
      // Si la page devient vide après suppression, revenir à la page précédente
      const remaining = this._sales().filter((s) => s.id !== id).length;
      if (remaining === 0 && this.currentPage() > 0) {
        this.currentPage.update((p) => p - 1);
      }
      await this.applyFilters();
    } catch (err) {
      console.error('VenteStore: erreur suppression', err);
      this.error.set('Impossible de supprimer la vente.');
      throw err;
    }
  }
}
