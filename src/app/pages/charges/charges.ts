// src/app/pages/charges/charges.ts

import { Component, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Template } from "../../components/shared/template/template";
import type { Charge } from '../../models/finance';
import { Sale } from '../../models/sale';
import { FinanceForm } from '../../components/shared/finance-form/finance-form';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { ConfirmDialog } from '../../components/shared/confirm/confirm';
import { PreferencesService } from '../../services/preferences';
import { ChargeStoreService } from '../../service/store/charge/charge-store.service';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule, Template, ActionMenu, ConfirmDialog, FinanceForm],
  templateUrl: './charges.html',
  styleUrls: ['./charges.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesComponent {
  protected readonly prefs = inject(PreferencesService);
  protected readonly store = inject(ChargeStoreService);

  editingCharge: Charge | null = null;
  isAddModalOpen = signal(false);
  confirmDeleteId = signal<string | null>(null);
  viewingCharge = signal<Charge | null>(null);

  // --- Barre de recherche inline (liée au store) ---
  get searchTerm() { return this.store.searchTerm; }

  // --- Pagination ---
  readonly pageCourante = signal(1);
  readonly parPage = 6;

  readonly nombrePages = computed(() =>
    Math.max(1, Math.ceil(this.store.filteredCharges().length / this.parPage))
  );

  readonly chargesPage = computed(() => {
    const debut = (this.pageCourante() - 1) * this.parPage;
    return this.store.filteredCharges().slice(debut, debut + this.parPage);
  });

  constructor() {
    effect(() => {
      const max = this.nombrePages();
      if (this.pageCourante() > max) this.pageCourante.set(max);
    });
    // Réinitialiser la pagination quand la recherche change
    effect(() => {
      this.store.searchTerm();
      this.pageCourante.set(1);
    });
  }

  // --- Actions de recherche ---
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.pageCourante.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.pageCourante.set(1);
  }

  // --- Filtres ---
  applyFilter(): void {
    this.appliedSearchTerm.set(this.filterSearchTerm());
    this.appliedDate.set(this.filterDate());
    this.pageCourante.set(1);
    this.isFilterModalOpen.set(false);
  }

  resetFilter(): void {
    this.filterSearchTerm.set('');
    this.filterDate.set('');
    this.appliedSearchTerm.set('');
    this.appliedDate.set('');
    this.searchTerm.set('');
    this.pageCourante.set(1);
    this.isFilterModalOpen.set(false);
  }

  openFilterModal(): void {
    this.filterSearchTerm.set(this.appliedSearchTerm());
    this.filterDate.set(this.appliedDate());
    this.isFilterModalOpen.set(true);
  }

  // --- Pagination ---
  pageSuivante() { this.pageCourante.update(v => Math.min(v + 1, this.nombrePages())); }
  pagePrecedente() { this.pageCourante.update(v => Math.max(v - 1, 1)); }

  // --- CRUD ---
  openAdd() {
    this.editingCharge = null;
    this.isAddModalOpen.set(true);
  }

  closeAdd() {
    this.isAddModalOpen.set(false);
    this.editingCharge = null;
  }

  async handleChargeSubmit(payload: Sale | Charge) {
    const c = payload as Charge;
    if (this.editingCharge) {
      const { id, ...rest } = c;
      await this.store.update(this.editingCharge.id, rest);
    } else {
      const { id, ...rest } = c as any;
      await this.store.add(rest);
    }
    this.closeAdd();
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