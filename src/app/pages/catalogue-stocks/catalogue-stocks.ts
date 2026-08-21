import { Component, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProduitService } from '../../services/produit.service';
import { ProduitForm } from './produit-form/produit-form';
import { Produit } from '../../models/produit';
import { Template } from '../../components/shared/template/template';
import { PreferencesService } from '../../services/preferences';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type StatutStock = 'ok' | 'warning' | 'error';

@Component({
  selector: 'app-catalogue-stocks',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, ProduitForm, Template],
  templateUrl: './catalogue-stocks.html',
  styleUrl: './catalogue-stocks.css',
})
export class CatalogueStocks {
    protected readonly prefs = inject(PreferencesService);
  private readonly produitService = inject(ProduitService);
  private readonly destroyRef = inject(DestroyRef);

  readonly catalogue = this.produitService.catalogue;

  // --- Recherche + filtres ---
  readonly recherche = signal('');
  readonly afficherFiltres = signal(false);
  readonly filtreCategorie = signal('');
  readonly filtreStatut = signal<'tous' | StatutStock>('tous');

  // --- Pagination ---
  readonly pageCourante = signal(1);
  readonly parPage = 5;

  // --- Modale ajout/edition ---
  readonly afficherFormulaire = signal(false);
  readonly produitEnEdition = signal<Produit | undefined>(undefined);

  // --- Confirmation de suppression ---
  readonly produitASupprimer = signal<Produit | undefined>(undefined);

  readonly Math = Math;

  readonly categories = computed(() => {
    const liste = this.catalogue.value() ?? [];
    return Array.from(new Set(liste.map((p) => p.categorie))).sort();
  });

  readonly produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const categorie = this.filtreCategorie();
    const statut = this.filtreStatut();
    const liste = this.catalogue.value() ?? [];

    return liste.filter((p) => {
      const matchTerme =
        !terme ||
        p.nom.toLowerCase().includes(terme) ||
        p.reference.toLowerCase().includes(terme);
      const matchCategorie = !categorie || p.categorie === categorie;
      const matchStatut = statut === 'tous' || this.statutStock(p) === statut;
      return matchTerme && matchCategorie && matchStatut;
    });
  });

  readonly nombrePages = computed(() =>
    Math.max(1, Math.ceil(this.produitsFiltres().length / this.parPage))
  );

  readonly produitsPage = computed(() => {
    const debut = (this.pageCourante() - 1) * this.parPage;
    return this.produitsFiltres().slice(debut, debut + this.parPage);
  });

  readonly pagesAffichees = computed(() =>
    Array.from({ length: this.nombrePages() }, (_, i) => i + 1)
  );

  readonly valorisationTotale = computed(() =>
    this.produitsFiltres().reduce(
      (total, p) => total + p.quantiteStock * p.prixAchat,
      0
    )
  );

  constructor() {
    // Recale toujours la page courante dans les bornes valides :
    // - quand un produit est ajouté, le nombre de pages augmente et "Suivant" devient utilisable
    // - quand un filtre/une recherche réduit la liste, on évite de rester bloqué sur une page vide
    effect(() => {
      const total = this.nombrePages();
      if (this.pageCourante() > total) {
        this.pageCourante.set(total);
      }
    });
  }

  statutStock(p: Produit): StatutStock {
    if (p.quantiteStock === 0) return 'error';
    if (p.quantiteStock <= p.seuilAlerte) return 'warning';
    return 'ok';
  }

  margeUnitaire(p: Produit): number {
    return (p.prixVente || 0) - (p.prixAchat || 0);
  }

  // --- Recherche & Filtres ---
  onRechercheChange(valeur: string) {
    this.recherche.set(valeur);
    this.pageCourante.set(1);
  }

  toggleFiltres() {
    this.afficherFiltres.update((v) => !v);
  }

  onFiltreCategorieChange(valeur: string) {
    this.filtreCategorie.set(valeur);
    this.pageCourante.set(1);
  }

  onFiltreStatutChange(valeur: 'tous' | StatutStock) {
    this.filtreStatut.set(valeur);
    this.pageCourante.set(1);
  }

  reinitialiserFiltres() {
    this.filtreCategorie.set('');
    this.filtreStatut.set('tous');
    this.pageCourante.set(1);
  }

  // --- Export PDF ---
  exporter() {
    const liste = this.produitsFiltres();
    if (liste.length === 0) return;

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('fr-FR');

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Bilanko — Catalogue & Stocks', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generer le : ${dateStr} | Total : ${liste.length} produit(s)`, 14, 27);

    const colonnes = ['Reference', 'Nom du produit', 'Categorie', 'Qte', 'Seuil', 'Prix Achat (FCFA)'];
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

  // --- Ajout / edition ---
  ouvrirCreation() {
    this.produitEnEdition.set(undefined);
    this.afficherFormulaire.set(true);
  }

  ouvrirEdition(p: Produit) {
    this.produitEnEdition.set(p);
    this.afficherFormulaire.set(true);
  }

  fermerFormulaire() {
    this.afficherFormulaire.set(false);
  }

  onEnregistrer(donnees: Omit<Produit, 'id'>) {
    const enEdition = this.produitEnEdition();
    const requete = enEdition
      ? this.produitService.modifier(enEdition.id, donnees)
      : this.produitService.ajouter(donnees);

    requete.subscribe({
      next: () => {
        this.fermerFormulaire();
      },
      error: (e) => console.error('Erreur enregistrement produit :', e),
    });
  }

  // --- Suppression ---
  demanderSuppression(p: Produit) {
    this.produitASupprimer.set(p);
  }

  annulerSuppression() {
    this.produitASupprimer.set(undefined);
  }

  confirmerSuppression() {
    const p = this.produitASupprimer();
    if (!p) return;

    this.produitService
      .supprimer(p.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.produitASupprimer.set(undefined);
        },
        error: (e) => console.error('Erreur suppression produit :', e),
      });
  }

  // --- Pagination ---
  pageSuivante() {
    this.pageCourante.update((v) => Math.min(v + 1, this.nombrePages()));
  }
  pagePrecedente() {
    this.pageCourante.update((v) => Math.max(v - 1, 1));
  }
  allerAPage(n: number) {
    this.pageCourante.set(n);
  }

}