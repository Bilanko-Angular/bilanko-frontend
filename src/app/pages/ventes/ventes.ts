// src/app/pages/ventes/ventes.ts

import { Component, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { Sale } from '../../models/sale';
import { Template } from "../../components/shared/template/template";
import { ConfirmDialog } from '../../components/shared/confirm/confirm';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { PanierForm } from './panier-form/panier-form';
import { SalesService } from '../../services/sales.service';
import { PreferencesService } from '../../services/preferences';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, FormsModule, Template, ConfirmDialog, ActionMenu, PanierForm],
  templateUrl: './ventes.html',
  styleUrls: ['./ventes.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesComponent {
  private salesService = inject(SalesService);
  private router = inject(Router);
  protected readonly prefs = inject(PreferencesService);

  isAddModalOpen = signal(false);
  isFilterModalOpen = signal(false);
  confirmDeleteId = signal<string | null>(null);
  editingSale: Sale | null = null;

  sales = this.salesService.sales;

  // --- BARRE DE RECHERCHE (RAPIDE) ---
  searchTerm = signal('');           // Texte tapé dans la barre de recherche
  filteredBySearch = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.sales();
    
    return this.sales().filter(s =>
      s.customerName.toLowerCase().includes(term) ||
      s.items.some(i => i.productName.toLowerCase().includes(term)) ||
      s.id.toLowerCase().includes(term)
    );
  });

  // --- FILTRE AVANCÉ (Modale) ---
  filterSearchTerm = signal('');
  filterDate = signal('');
  appliedSearchTerm = signal('');
  appliedDate = signal('');

  // Combine recherche rapide + filtres avancés
  readonly filteredSales = computed(() => {
    const term = this.appliedSearchTerm().trim().toLowerCase();
    const date = this.appliedDate();
    let results = this.filteredBySearch(); // Déjà filtré par la recherche rapide

    // Appliquer le filtre avancé par texte (si différent de la recherche rapide)
    if (term && this.searchTerm().trim().toLowerCase() !== term) {
      results = results.filter(s =>
        s.customerName.toLowerCase().includes(term) ||
        s.items.some(i => i.productName.toLowerCase().includes(term))
      );
    }

    // Filtrer par date
    if (date) {
      results = results.filter(s => s.saleDate.startsWith(date));
    }

    return results;
  });

  // --- Indicateur de filtre actif ---
  readonly hasActiveFilter = computed(() =>
    this.searchTerm().trim().length > 0 ||
    this.appliedSearchTerm().trim().length > 0 ||
    this.appliedDate().length > 0
  );

  // --- Pagination ---
  readonly pageCourante = signal(1);
  readonly parPage = 6;

  readonly nombrePages = computed(() =>
    Math.max(1, Math.ceil(this.filteredSales().length / this.parPage))
  );

  readonly salesPage = computed(() => {
    const debut = (this.pageCourante() - 1) * this.parPage;
    return this.filteredSales().slice(debut, debut + this.parPage);
  });

  constructor() {
    effect(() => {
      const max = this.nombrePages();
      if (this.pageCourante() > max) this.pageCourante.set(max);
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

  // --- Filtres avancés ---
  applyFilter(): void {
    this.appliedSearchTerm.set(this.filterSearchTerm());
    this.appliedDate.set(this.filterDate());
    this.pageCourante.set(1);
    this.closeFilterModal();
  }

  resetFilter(): void {
    this.filterSearchTerm.set('');
    this.filterDate.set('');
    this.appliedSearchTerm.set('');
    this.appliedDate.set('');
    this.searchTerm.set('');
    this.pageCourante.set(1);
    this.closeFilterModal();
  }

  // --- Pagination ---
  pageSuivante() { this.pageCourante.update(v => Math.min(v + 1, this.nombrePages())); }
  pagePrecedente() { this.pageCourante.update(v => Math.max(v - 1, 1)); }

  // --- Modales ---
  openAddModal() { this.editingSale = null; this.isAddModalOpen.set(true); }
  closeAddModal() { this.isAddModalOpen.set(false); this.editingSale = null; }

  openFilterModal() {
    this.filterSearchTerm.set(this.appliedSearchTerm());
    this.filterDate.set(this.appliedDate());
    this.isFilterModalOpen.set(true);
  }
  closeFilterModal() { this.isFilterModalOpen.set(false); }

  voirVente(id: string) {
    this.router.navigate(['/ventes', id]);
  }

  editSale(id: string) {
    const s = this.salesService.getById(id) || null;
    if (s) {
      this.editingSale = s;
      this.isAddModalOpen.set(true);
    }
  }

  onRowAction(actionType: string, id: string) {
    if (actionType === 'view') this.voirVente(id);
    if (actionType === 'edit') this.editSale(id);
    if (actionType === 'delete') this.confirmDeleteId.set(id);
  }

  confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) this.salesService.delete(id);
    this.confirmDeleteId.set(null);
  }
  cancelDelete() { this.confirmDeleteId.set(null); }

  handleSaleSubmit(payload: Omit<Sale, 'id'>) {
    if (this.editingSale) {
      this.salesService.update(this.editingSale.id, payload);
    } else {
      this.salesService.add(payload);
    }
    this.closeAddModal();
  }
}