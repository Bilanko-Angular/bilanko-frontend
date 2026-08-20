import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProduitService } from '../../services/produit.service';
import { ProduitForm } from './produit-form/produit-form';
import { Produit } from '../../models/produit';
import { Template } from '../../components/shared/template/template';

type StatutStock = 'ok' | 'warning' | 'error';

@Component({
  selector: 'app-catalogue-stocks',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, ProduitForm, Template],
  templateUrl: './catalogue-stocks.html',
  styleUrl: './catalogue-stocks.css',
})
export class CatalogueStocks {
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

  // --- Modale ajout/édition ---
  readonly afficherFormulaire = signal(false);
  readonly produitEnEdition = signal<Produit | undefined>(undefined);

  // --- Confirmation de suppression ---
  readonly produitASupprimer = signal<Produit | undefined>(undefined);

  readonly Math = Math;

  // Catégories réellement présentes dans le catalogue, déduites automatiquement
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
      const matchTerme = !terme || p.nom.toLowerCase().includes(terme) || p.reference.toLowerCase().includes(terme);
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
    this.produitsFiltres().reduce((total, p) => total + p.quantiteStock * p.prixAchat, 0)
  );

  statutStock(p: Produit): StatutStock {
    if (p.quantiteStock === 0) return 'error';
    if (p.quantiteStock <= p.seuilAlerte) return 'warning';
    return 'ok';
  }

  // --- Filtres ---
  toggleFiltres() {
    this.afficherFiltres.update((v) => !v);
  }

  reinitialiserFiltres() {
    this.filtreCategorie.set('');
    this.filtreStatut.set('tous');
    this.pageCourante.set(1);
  }

  // --- Export CSV ---
  exporter() {
    const liste = this.produitsFiltres();
    if (liste.length === 0) return;

    const entetes = ['Référence', 'Nom', 'Catégorie', 'Quantité en stock', 'Seuil alerte', "Prix d'achat (FCFA)"];
    const lignes = liste.map((p) =>
      [p.reference, p.nom, p.categorie, p.quantiteStock, p.seuilAlerte, p.prixAchat].join(';')
    );
    const contenu = [entetes.join(';'), ...lignes].join('\n');

    const blob = new Blob(['\uFEFF' + contenu], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `catalogue-bilanko-${new Date().toISOString().split('T')[0]}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  }

  // --- Ajout / édition ---
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

    requete.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.catalogue.reload();
        this.fermerFormulaire();
      },
      error: (e) => console.error('Erreur enregistrement produit :', e),
    });
  }

  // --- Suppression avec confirmation ---
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
          this.catalogue.reload();
          this.produitASupprimer.set(undefined);
        },
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