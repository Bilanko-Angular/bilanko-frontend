import { Injectable, signal, computed, inject } from '@angular/core';
import { ChargeApiService } from '../../api/charge/charge-api.service';
import { ChargeMapper } from '../../../mapper/ChargeMapper';
import type { Charge } from '../../../models/finance';
import type {
  ChargeSummaryDTO,
  ChargeUserSummary,
  ChargeFilterParams,
  ChargeSearchParams,
} from '../../../models/DTO/ChargeDto';

@Injectable({
  providedIn: 'root',
})
export class ChargeStoreService {
  private readonly chargeApi = inject(ChargeApiService);

  // ──────────────────────────────────────────
  // État central
  // ──────────────────────────────────────────

  private readonly _charges = signal<Charge[]>([]);
  readonly isLoading    = signal<boolean>(false);
  readonly error        = signal<string | null>(null);

  // --- Pagination (gérée côté serveur) ---
  readonly currentPage   = signal<number>(0);         // 0-indexed (Spring)
  readonly pageSize      = signal<number>(20);
  readonly totalElements = signal<number>(0);
  readonly totalPages    = signal<number>(0);

  // --- Filtres de période (GET /api/charges) ---
  readonly fromDate = signal<string | undefined>(undefined);
  readonly toDate   = signal<string | undefined>(undefined);

  // --- Mode de chargement actif ---
  /** 'list' = getAllCharges, 'search' = searchCharges */
  private readonly _mode = signal<'list' | 'search'>('list');
  private _lastSearchParams: ChargeSearchParams = {};

  // --- Résumé financier ---
  readonly summary = signal<ChargeSummaryDTO | null>(null);
  readonly userSummary = signal<ChargeUserSummary | null>(null);

  // --- Terme de recherche textuelle (branché sur /search?label=) ---
  readonly searchTerm = signal<string>('');

  // --- Exposition en lecture seule ---
  readonly charges = this._charges.asReadonly();

  /**
   * Alias de charges() — la pagination et le filtrage sont gérés côté serveur.
   * Conservé pour compatibilité avec les composants existants.
   */
  readonly filteredCharges = this._charges.asReadonly();

  /** Indique s'il reste une page suivante */
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);

  /** Indique s'il y a une page précédente */
  readonly hasPrevPage = computed(() => this.currentPage() > 0);

  constructor() {
    this.loadPage();
    this.loadSummary();
    this.loadUserSummary();
  }

  // ──────────────────────────────────────────
  // Lecture paginée — GET /api/charges
  // ──────────────────────────────────────────

  /**
   * Charge une page de charges depuis le backend avec filtres de période optionnels.
   * @param page  Index de la page (0-based), par défaut utilise currentPage()
   * @param params Paramètres optionnels (from, to, size) — surchargent les signals
   */
  async loadPage(params: ChargeFilterParams = {}): Promise<void> {
    this._mode.set('list');
    this.isLoading.set(true);
    this.error.set(null);

    const page = params.page ?? this.currentPage();
    const size = params.size ?? this.pageSize();
    const from = params.from  ?? this.fromDate();
    const to   = params.to    ?? this.toDate();

    try {
      const pageData = await this.chargeApi.getAllCharges({ page, size, from, to });
      const mapped   = ChargeMapper.fromPageResponse(pageData);

      this._charges.set(mapped.charges);
      this.currentPage.set(mapped.currentPage);
      this.totalElements.set(mapped.totalElements);
      this.totalPages.set(mapped.totalPages);

      // Mettre à jour les signals de filtre si passés explicitement
      if (params.from !== undefined) this.fromDate.set(params.from);
      if (params.to   !== undefined) this.toDate.set(params.to);
      if (params.size !== undefined) this.pageSize.set(params.size);
    } catch (err) {
      console.error('ChargeStore: erreur lors du chargement', err);
      this.error.set('Impossible de charger les charges.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ──────────────────────────────────────────
  // Recherche avancée — GET /api/charges/search
  // ──────────────────────────────────────────

  /**
   * Lance une recherche avancée côté backend.
   * Mémorise les params pour pouvoir recharger la même page après une mutation.
   */
  async search(params: ChargeSearchParams): Promise<void> {
    this._mode.set('search');
    this._lastSearchParams = params;
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const pageData = await this.chargeApi.searchCharges({
        ...params,
        page: params.page ?? 0,
        size: params.size ?? this.pageSize(),
      });
      const mapped = ChargeMapper.fromPageResponse(pageData);

      this._charges.set(mapped.charges);
      this.currentPage.set(mapped.currentPage);
      this.totalElements.set(mapped.totalElements);
      this.totalPages.set(mapped.totalPages);
    } catch (err) {
      console.error('ChargeStore: erreur lors de la recherche', err);
      this.error.set('Impossible d\'effectuer la recherche.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ──────────────────────────────────────────
  // Résumé — GET /api/charges/summary
  // ──────────────────────────────────────────

  async loadSummary(from?: string, to?: string): Promise<void> {
    try {
      const data = await this.chargeApi.getSummary(from, to);
      this.summary.set(data);
    } catch (err) {
      console.error('ChargeStore: erreur lors du chargement du résumé', err);
      // Ne pas bloquer l'UI pour le résumé
    }
  }

  async loadUserSummary(): Promise<void> {
    try {
      this.userSummary.set(await this.chargeApi.getUserSummary());
    } catch (err) {
      console.error('ChargeStore: erreur lors du chargement du résumé utilisateur', err);
      this.userSummary.set(null);
    }
  }

  // ──────────────────────────────────────────
  // Création
  // ──────────────────────────────────────────

  async add(charge: Omit<Charge, 'id'>): Promise<void> {
    const dto = ChargeMapper.toRequestDTO(charge);
    try {
      await this.chargeApi.createCharge(dto);
    } catch (err) {
      console.error('ChargeStore: erreur lors de la création', err);
      this.error.set('Impossible de créer la charge.');
      throw err;
    }
    await this.refreshAfterMutation();
  }

  // ──────────────────────────────────────────
  // Mise à jour
  // ──────────────────────────────────────────

  async update(id: string, charge: Omit<Charge, 'id'>): Promise<void> {
    const numericId = Number(id);
    const dto = ChargeMapper.toRequestDTO(charge);
    try {
      await this.chargeApi.updateCharge(numericId, dto);
    } catch (err) {
      console.error('ChargeStore: erreur lors de la mise à jour', err);
      this.error.set('Impossible de mettre à jour la charge.');
      throw err;
    }
    await this.refreshAfterMutation();
  }

  // ──────────────────────────────────────────
  // Suppression
  // ──────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const numericId = Number(id);
    try {
      await this.chargeApi.deleteCharge(numericId);
    } catch (err) {
      console.error('ChargeStore: erreur lors de la suppression', err);
      this.error.set('Impossible de supprimer la charge.');
      throw err;
    }
    await this.refreshAfterMutation();
  }

  // ──────────────────────────────────────────
  // Navigation entre pages
  // ──────────────────────────────────────────

  goToPage(page: number): Promise<void> {
    if (this._mode() === 'search') {
      return this.search({ ...this._lastSearchParams, page });
    }
    return this.loadPage({ page });
  }

  nextPage(): Promise<void> {
    return this.goToPage(this.currentPage() + 1);
  }

  prevPage(): Promise<void> {
    return this.goToPage(this.currentPage() - 1);
  }

  // ──────────────────────────────────────────
  // Filtres de période
  // ──────────────────────────────────────────

  /** Applique un filtre de période et recharge depuis la page 0 */
  applyDateFilter(from?: string, to?: string): Promise<void> {
    return this.loadPage({ from, to, page: 0 });
  }

  /** Réinitialise les filtres de période */
  resetDateFilter(): Promise<void> {
    this.fromDate.set(undefined);
    this.toDate.set(undefined);
    return this.loadPage({ page: 0 });
  }

  // ──────────────────────────────────────────
  // Privé
  // ──────────────────────────────────────────

  /** Recharge la page courante selon le mode actif (list ou search) */
  private _reload(): Promise<void> {
    if (this._mode() === 'search') {
      return this.search({ ...this._lastSearchParams, page: this.currentPage() });
    }
    return this.loadPage({ page: this.currentPage() });
  }

  private async refreshAfterMutation(): Promise<void> {
    try {
      await Promise.all([this._reload(), this.loadSummary(), this.loadUserSummary()]);
    } catch (err) {
      console.error('ChargeStore: erreur lors du rafraîchissement après mutation', err);
    }
  }
}
