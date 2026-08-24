import { Component, inject, signal, effect } from '@angular/core';
import { ProduitStoreService } from '../../service/store/product/produit-store.service';
import { CategoryApiService } from '../../service/api/product/category-api.service';
import { ProductSearchBar } from '../../components/catalogue-stock/product-search-bar/product-search-bar';
import { ProductFilterDropdown, FiltresProduit, CategorieOption } from '../../components/catalogue-stock/product-filter-dropdown/product-filter-dropdown';
import { ProductTable } from '../../components/catalogue-stock/product-table/product-table';
import { ProductPagination } from '../../components/catalogue-stock/product-pagination/product-pagination';
import { ProductDeleteModal } from '../../components/catalogue-stock/product-delete-modal/product-delete-modal';
import { ProduitForm } from '../../pages/catalogue-stocks/produit-form/produit-form';
import { Template } from '../../components/shared/template/template';
import { PreferencesService } from '../../services/preferences';
import { Produit } from '../../models/produit';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-catalogue-stocks',
  standalone: true,
  imports: [
    ProductSearchBar,
    ProductFilterDropdown,
    ProductTable,
    ProductPagination,
    ProductDeleteModal,
    ProduitForm,
    Template,
  ],
  templateUrl: './catalogue-stocks.html',
})
export class CatalogueStocks {
  protected readonly prefs = inject(PreferencesService);
  private readonly store = inject(ProduitStoreService);
  private readonly categoryApi = inject(CategoryApiService);

  // ── État issu du store (produits, pagination, chargement) ────────────
  readonly produits = this.store.produits;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly totalElements = this.store.totalElements;
  readonly totalPages = this.store.totalPages;
  readonly pageCourante = this.store.pageCourante;

  // ── Filtres locaux (pilotent la recherche côté backend) ───────────────
  readonly recherche = signal('');
  readonly categorieId = signal<number | undefined>(undefined);
  readonly statutStock = signal<'tous' | 'ok' | 'warning' | 'error'>('tous');

  // ── Catégories pour le dropdown de filtre ──────────────────────────────
  readonly categoriesOptions = signal<CategorieOption[]>([]);

  // ── Formulaire ajout/édition ────────────────────────────────────────
  readonly afficherFormulaire = signal(false);
  readonly produitEnEdition = signal<Produit | undefined>(undefined);

  // ── Confirmation suppression ────────────────────────────────────────
  readonly produitASupprimer = signal<Produit | undefined>(undefined);

  constructor() {
    this.chargerCategories();

    // Relance la recherche à chaque changement de filtre/page
    effect(() => {
      this.store.rechercher({
        search: this.recherche(),
        categoryId: this.categorieId(),
        stockStatus: this.statutStock(),
        page: this.pageCourante(),
      });
    });
  }

  private async chargerCategories(): Promise<void> {
    try {
      this.categoriesOptions.set(await this.categoryApi.getAll());
    } catch (e) {
      console.error('Erreur chargement catégories :', e);
    }
  }

  // ── Recherche & filtres ─────────────────────────────────────────────
  onRechercheChange(valeur: string): void {
    this.recherche.set(valeur);
    this.store.allerAPage(0);
  }

  onFiltresChange(filtres: FiltresProduit): void {
    this.categorieId.set(filtres.categorieId);
    this.statutStock.set(filtres.statut);
    this.store.allerAPage(0);
  }

  onChangerPage(page: number): void {
    this.store.allerAPage(page);
  }

  // ── Export PDF ───────────────────────────────────────────────────────
  exporter(): void {
    const liste = this.produits();
    if (liste.length === 0) return;

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('fr-FR');

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Bilanko — Catalogue & Stocks', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Généré le : ${dateStr} | Total : ${liste.length} produit(s)`, 14, 27);

    const colonnes = ['Référence', 'Nom du produit', 'Catégorie', 'Qté', 'Seuil', 'Prix Achat (FCFA)'];
    const donnees = liste.map((p) => [
      p.reference,
      p.nom,
      p.categorie,
      p.quantiteStock.toString(),
      p.seuilAlerte.toString(),
      p.prixAchat.toLocaleString('fr-FR'),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [colonnes],
      body: donnees,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    doc.save(`catalogue-bilanko-${dateStr.replace(/\//g, '-')}.pdf`);
  }

  // ── Ajout / édition ──────────────────────────────────────────────────
  ouvrirCreation(): void {
    this.produitEnEdition.set(undefined);
    this.afficherFormulaire.set(true);
  }

  ouvrirEdition(p: Produit): void {
    this.produitEnEdition.set(p);
    this.afficherFormulaire.set(true);
  }

  fermerFormulaire(): void {
    this.afficherFormulaire.set(false);
  }

  async onEnregistrer(donnees: any): Promise<void> {
    try {
      const enEdition = this.produitEnEdition();
      if (enEdition) {
        await this.store.modifier(enEdition.id, donnees);
      } else {
        await this.store.ajouter(donnees);
      }
      this.fermerFormulaire();
    } catch (e) {
      console.error('Erreur enregistrement produit :', e);
    }
  }

  // ── Suppression ──────────────────────────────────────────────────────
  demanderSuppression(p: Produit): void {
    this.produitASupprimer.set(p);
  }

  annulerSuppression(): void {
    this.produitASupprimer.set(undefined);
  }

  async confirmerSuppression(): Promise<void> {
    const p = this.produitASupprimer();
    if (!p) return;
    try {
      await this.store.supprimer(p.id);
      this.produitASupprimer.set(undefined);
    } catch (e) {
      console.error('Erreur suppression produit :', e);
    }
  }
}