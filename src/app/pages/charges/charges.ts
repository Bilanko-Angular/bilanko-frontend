// src/app/pages/charges/charges.ts

import { Component, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Template } from "../../components/shared/template/template";
import type { Charge } from '../../models/finance';
import { Sale } from '../../models/sale';
import { FinanceForm } from '../../components/shared/finance-form/finance-form';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { ConfirmDialog } from '../../components/shared/confirm/confirm';
import { PreferencesService } from '../../service/app/preference/preferences';
import { ChargeStoreService } from '../../service/store/charge/charge-store.service';
import { BasicSearchBar } from '../../components/shared/ui/basic-search-bar/basic-search-bar';
import { CategoryApiService } from '../../service/api/product/category-api.service';
import { CategoryType } from '../../models/category';
import type { CategorieOption } from '../../components/catalogue-stock/product-filter-dropdown/product-filter-dropdown';
import { ActionResponseService } from '../../service/action-response/action-response.service';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, DecimalPipe, FormsModule, Template, ActionMenu, ConfirmDialog, FinanceForm, BasicSearchBar],
  templateUrl: './charges.html',
  styleUrls: ['./charges.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesComponent {
  protected readonly prefs = inject(PreferencesService);
  protected readonly store = inject(ChargeStoreService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly action = inject(ActionResponseService);
  private readonly route = inject(ActivatedRoute);

  editingCharge: Charge | null = null;
  isAddModalOpen = signal(false);
  confirmDeleteId = signal<string | null>(null);
  viewingCharge = signal<Charge | null>(null);
  readonly categories = signal<CategorieOption[]>([]);
  readonly categoriesLoading = signal(false);
  readonly categoriesError = signal<string | null>(null);
  readonly isCreating = signal(false);

  // --- FILTRE ---
  readonly filterOpen = signal(false);
  readonly filterPeriod = signal<'all' | 'today' | 'week' | 'month'>('all');
  readonly filterSupplier = signal('');

  // --- BARRE DE RECHERCHE (délégué au store) ---
  get searchTerm() { return this.store.searchTerm; }

  // --- FOURNISSEURS UNIQUES POUR LE FILTRE (extraits de la page courante) ---
  readonly fournisseurs = computed(() => {
    const charges = this.store.charges();
    const unique = new Set<string>();
    charges.forEach(c => {
      if (c.supplier) unique.add(c.supplier);
    });
    return Array.from(unique).sort();
  });

  // --- INDICATEUR DE FILTRE ACTIF ---
  readonly hasActiveFilter = computed(() => {
    return this.filterPeriod() !== 'all'
      || this.filterSupplier() !== ''
      || this.store.searchTerm() !== '';
  });

  constructor() {
    void this.loadCategories();
    const viewId = this.route.snapshot.queryParamMap.get('viewId');
    if (viewId) {
      effect(() => {
        const charge = this.store.charges().find((item) => item.id === viewId);
        if (charge) this.viewingCharge.set(charge);
      });
    }

  }

  private async loadCategories(): Promise<void> {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    try {
      this.categories.set(await this.categoryApi.getAll(CategoryType.CHARGE));
    } catch (err) {
      console.error('Erreur chargement catégories de charges', err);
      this.categoriesError.set('Impossible de charger les catégories.');
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  // ──────────────────────────────────────────
  // Recherche + Filtres → backend
  // ──────────────────────────────────────────

  /** Appelé par la barre de recherche — déclenche /search?label= côté serveur */
  onSearchChange(value: string): void {
    this.store.searchTerm.set(value);
    this._applySearchToBackend();
  }

  clearSearch(): void {
    this.store.searchTerm.set('');
    this._applySearchToBackend();
  }

  toggleFilter(): void {
    this.filterOpen.update(v => !v);
  }

  setFilterPeriod(period: 'all' | 'today' | 'week' | 'month'): void {
    this.filterPeriod.set(period);
  }

  /** Applique tous les filtres actifs vers le backend */
  applyFilter(): void {
    this.filterOpen.set(false);
    this._applySearchToBackend();
  }

  resetFilter(): void {
    this.filterPeriod.set('all');
    this.filterSupplier.set('');
    this.store.searchTerm.set('');
    this.filterOpen.set(false);
    this.store.resetDateFilter();
  }

  /** Construit les paramètres de filtre et délègue au store */
  private _applySearchToBackend(): void {
    const label = this.store.searchTerm();
    const supplier = this.filterSupplier();
    const { from, to } = this._periodToDateRange(this.filterPeriod());

    const hasSearchCriteria = label || supplier || from || to;

    if (hasSearchCriteria) {
      this.store.search({
        ...(label    && { label }),
        ...(supplier && { supplier }),
        ...(from     && { date: from }), // on utilise date pour filtre journalier
        page: 0,
      });
      if (from || to) {
        // Si période > aujourd'hui, on utilise applyDateFilter pour from/to
        this.store.applyDateFilter(from, to);
      }
    } else {
      this.store.resetDateFilter();
    }
  }

  /** Convertit une période nommée en intervalle de dates ISO */
  private _periodToDateRange(period: 'all' | 'today' | 'week' | 'month'): { from?: string; to?: string } {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = toISO(now);

    if (period === 'today') {
      return { from: today, to: today };
    }
    if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return { from: toISO(weekStart), to: today };
    }
    if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISO(monthStart), to: today };
    }
    return {};
  }

  // --- EXPORT (placeholder) ---
  exporter(): void {
    console.log('📤 Export des charges (à implémenter avec le backend)');
  }

  // --- PAGINATION SERVEUR ---
  pageSuivante(): void  { this.store.nextPage(); }
  pagePrecedente(): void { this.store.prevPage(); }

  // --- CRUD ---
  openAdd() {
    this.editingCharge = null;
    this.isAddModalOpen.set(true);
  }

  closeAdd() {
    this.isAddModalOpen.set(false);
    this.editingCharge = null;
  }

  async handleChargeSubmit(payload: Sale | Charge): Promise<void> {
    const c = payload as Charge;
    this.isCreating.set(true);
    try {
      if (this.editingCharge) {
        const { id, ...rest } = c;
        await this.store.update(this.editingCharge.id, rest);
        this.action.success('Charge modifiée avec succès.');
      } else {
        const { id, ...rest } = c;
        await this.store.add(rest);
        this.action.success('Charge créée avec succès.');
      }
      this.closeAdd();
    } catch (err) {
      this.action.error(err);
    } finally {
      this.isCreating.set(false);
    }
  }

  showDeleteConfirm(id: string) {
    this.confirmDeleteId.set(id);
  }

  async confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) await this.store.delete(id);
    this.confirmDeleteId.set(null);
  }

  cancelDelete() {
    this.confirmDeleteId.set(null);
  }

  viewCharge(id: string) {
    const c = this.store.charges().find(x => x.id === id) || null;
    this.viewingCharge.set(c);
  }

  closeView() {
    this.viewingCharge.set(null);
  }

  onChargeAction(actionType: string, id: string) {
    if (actionType === 'delete') this.showDeleteConfirm(id);
    if (actionType === 'edit') {
      const c = this.store.charges().find((x) => x.id === id) || null;
      if (c) {
        this.editingCharge = c;
        this.isAddModalOpen.set(true);
      }
    }
    if (actionType === 'view') this.viewCharge(id);
  }
}
