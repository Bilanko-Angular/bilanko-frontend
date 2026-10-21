// src/app/pages/ventes/ventes.ts

import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import {DatePipe, CurrencyPipe, DecimalPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { Sale } from '../../models/sale';
import { Template } from '../../components/shared/template/template';
import { ConfirmDialog } from '../../components/shared/confirm/confirm';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { PanierForm } from './panier-form/panier-form';
import { PreferencesService } from '../../service/app/preference/preferences';
import { VenteStoreService } from '../../service/store/vente/vente-store.service';
import { BasicSearchBar } from '../../components/shared/ui/basic-search-bar/basic-search-bar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {VenteApiService} from '../../service/api/vente/vente-api.service';
import SaleUserSummary from '../../models/DTO/SalesUserSummary';
import {ActionResponseService} from '../../service/action-response/action-response.service';

import { SkeletonSummaryCards } from '../../components/shared/ui/skeleton-summary-cards/skeleton-summary-cards';
import { SaleSkeletonRow } from '../../components/shared/ui/sale-skeleton-row/sale-skeleton-row';
import { SkeletonSearchBar } from '../../components/shared/ui/skeleton-search-bar/skeleton-search-bar';
import { SkeletonPagination } from '../../components/shared/ui/skeleton-pagination/skeleton-pagination';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    FormsModule,
    Template,
    ConfirmDialog,
    ActionMenu,
    PanierForm,
    BasicSearchBar,
    DecimalPipe,
    SkeletonSummaryCards,
    SaleSkeletonRow,
    SkeletonSearchBar,
    SkeletonPagination,
  ],
  templateUrl: './ventes.html',
  styleUrls: ['./ventes.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {
  protected readonly store = inject(VenteStoreService);
  private readonly router = inject(Router);
  protected readonly prefs = inject(PreferencesService);
  private action =inject(ActionResponseService)

  isAddModalOpen = signal(false);
  isFilterModalOpen = signal(false);
  confirmDeleteId = signal<string | null>(null);
  isCreating=signal(false);
  readonly summary = signal<SaleUserSummary | null >(null)
  editingSale: Sale | null = null;

  /** Valeur temporaire dans la modale filtre (date) */
  filterDateDraft = signal('');

  readonly hasActiveFilter = computed(
    () => this.store.searchTerm().trim().length > 0 || this.store.filterDate().length > 0
  );

  // Besoin malsain de venteapi
  private readonly venteApi = inject(VenteApiService);

  constructor() {
    this.venteApi.getUserSummary()
      .then((data) => {
        this.summary.set(data);
        console.log(this.summary())
      })
      .catch((err) => {
        console.log("Erreur de chargement du résumé :"+ err);
      })
  }

  onSearchChange(value: string): void {
    this.store.setSearchTerm(value);
  }

  clearSearch(): void {
    this.store.setSearchTerm('');
  }

  openFilterModal(): void {
    this.filterDateDraft.set(this.store.filterDate());
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  applyFilter(): void {
    this.store.setFilterDate(this.filterDateDraft());
    this.closeFilterModal();
  }

  resetFilter(): void {
    this.filterDateDraft.set('');
    this.store.clearFilters();
    this.closeFilterModal();
  }

  pageSuivante(): void {
    this.store.pageSuivante();
  }

  pagePrecedente(): void {
    this.store.pagePrecedente();
  }

  openAddModal(): void {
    this.editingSale = null;
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
    this.editingSale = null;
  }

  voirVente(id: string): void {
    this.router.navigate(['/ventes', id]);
  }

  editSale(id: string): void {
    const s = this.store.findById(id) ?? null;
    if (s) {
      this.editingSale = s;
      this.isAddModalOpen.set(true);
    }
  }

  onRowAction(actionType: string, id: string): void {
    if (actionType === 'view') this.voirVente(id);
    if (actionType === 'edit') this.editSale(id);
    if (actionType === 'delete') this.confirmDeleteId.set(id);
  }

  async confirmDelete(): Promise<void> {
    const id = this.confirmDeleteId();
    if (id) await this.store.delete(id);
    this.confirmDeleteId.set(null);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  async handleSaleSubmit(payload: Omit<Sale, 'id'>): Promise<void> {
    this.isCreating.set(true)
    try {
      if (this.editingSale) {
        this.store.update(this.editingSale.id, payload)
          .then(()=>{
            this.action.success("Ajout d'une ventes")
          })
          .catch((err) => {
            this.action.error(err);
          })
          .finally(()=>{
            this.isCreating.set(false)
          })
      } else {
        this.store.add(payload)
          .then(()=>{
            this.action.success("Ajout d'une ventes")
          })
          .catch((err) => {
            this.action.error(err);
          })
          .finally(()=>{
            this.isCreating.set(false)
          })
      }
      this.closeAddModal();
    } catch {
      this.isCreating.set(false);
    }
  }

  exporterPdf(): void {
    const liste = this.store.filteredSales();
    if (liste.length === 0) return;

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const currency = this.prefs.currency();

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Bilanko — Historique des ventes', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Généré le : ${dateStr} | Total : ${this.store.totalElements()} vente(s) (page ${this.store.pageCourante()}/${this.store.nombrePages()})`,
      14,
      27
    );

    const colonnes = ['Date', 'Client', 'Produits', `Montant (${currency})`, `Marge (${currency})`];
    const donnees = liste.map((s) => [
      new Date(s.saleDate).toLocaleString('fr-FR'),
      s.customerName || this.prefs.t().comptantClient,
      s.items.length.toString(),
      s.totalAmount.toLocaleString('fr-FR'),
      (s.totalMargin ?? 0).toLocaleString('fr-FR'),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [colonnes],
      body: donnees,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    doc.save(`ventes-bilanko-${dateStr.replace(/\//g, '-')}.pdf`);
  }
}
