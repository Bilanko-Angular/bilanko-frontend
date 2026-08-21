// src/app/pages/catalogue-stocks/catalogue-stocks.ts
import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProduitService } from '../../services/produit.service';
import { ProduitForm } from './produit-form/produit-form';
import { Produit } from '../../models/produit';
import { Template } from '../../components/shared/template/template';
import { PreferencesService } from '../../services/preferences';

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

  // La ressource HTTP, exposée telle quelle depuis le service
  readonly catalogue = this.produitService.catalogue;

  // État local de la page (recherche + pagination + modale)
  readonly recherche = signal('');
  readonly pageCourante = signal(1);
  readonly parPage = 5;
  readonly afficherFormulaire = signal(false);
  readonly produitEnEdition = signal<Produit | undefined>(undefined);

  // Liste filtrée par la recherche (nom ou référence)
  readonly produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const liste = this.catalogue.value() ?? [];
    if (!terme) return liste;
    return liste.filter(
      (p) => p.nom.toLowerCase().includes(terme) || p.reference.toLowerCase().includes(terme),
    );
  });

  // Découpage en page
  readonly nombrePages = computed(() =>
    Math.max(1, Math.ceil(this.produitsFiltres().length / this.parPage)),
  );

  readonly produitsPage = computed(() => {
    const debut = (this.pageCourante() - 1) * this.parPage;
    return this.produitsFiltres().slice(debut, debut + this.parPage);
  });

  // Valorisation totale du stock en marge (comme sur la maquette)
  readonly valorisationTotale = computed(() =>
    this.produitsFiltres().reduce(
      (total, p) => total + p.quantiteStock * (p.prixVente - p.prixAchat),
      0,
    ),
  );

  // --- Calculs par ligne ---
  margeUnitaire(p: Produit): number {
    return p.prixVente - p.prixAchat;
  }

  statutStock(p: Produit): 'ok' | 'warning' | 'error' {
    if (p.quantiteStock === 0) return 'error';
    if (p.quantiteStock <= p.seuilAlerte) return 'warning';
    return 'ok';
  }

  // --- Ouverture / fermeture du formulaire ---
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

  // --- Écritures ---
  onEnregistrer(donnees: Omit<Produit, 'id'>) {
    const enEdition = this.produitEnEdition();
    const requete = enEdition
      ? this.produitService.modifier(enEdition.id, donnees)
      : this.produitService.ajouter(donnees);

    requete.subscribe({
      next: () => {
        this.catalogue.reload();
        this.fermerFormulaire();
      },
      error: (e) => console.error('Erreur enregistrement produit :', e),
    });
  }

  supprimer(p: Produit) {
    if (confirm('Supprimer ce produit ?')) {
      this.produitService
        .supprimer(p.id)
        .subscribe({ next: () => this.catalogue.reload() });
    }
  }

  // --- Filtres et export ---
  ouvrirFiltres() {
    console.log('Filtres - À implémenter');
  }

  exporter() {
    console.log('Export - À implémenter');
  }

  // --- Pagination ---
  pageSuivante() {
    this.pageCourante.update((v) => Math.min(v + 1, this.nombrePages()));
  }
  pagePrecedente() {
    this.pageCourante.update((v) => Math.max(v - 1, 1));
  }
  readonly pagesAffichees = computed(() => {
    const total = this.nombrePages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  allerAPage(n: number) {
    this.pageCourante.set(n);
  }

  readonly Math = Math;
}