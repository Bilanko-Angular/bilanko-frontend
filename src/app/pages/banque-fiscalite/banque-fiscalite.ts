import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { ProduitService } from '../../services/produit.service';
import { SalesService } from '../../services/sales.service';
import { ChargesService } from '../../services/charges.service';
import { Template } from '../../components/shared/template/template';
import { PreferencesService } from '../../services/preferences';
import {
  TypeDossier,
  RegimeFiscal,
  InfosCommercant,
  DemandeDossier,
  LigneHistorique,
  OBJETS_PRET,
  REGIMES_FISCAUX,
  PIECES_A_JOINDRE,
} from '../../models/document-fiscal';

type Etape = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-banque-fiscalite',
  standalone: true,
  imports: [FormsModule, Template],
  templateUrl: './banque-fiscalite.html',
  styleUrl: './banque-fiscalite.css',
})
export class BanqueFiscalite {
  private readonly documentService = inject(DocumentService);
  private readonly produitService = inject(ProduitService);
  private readonly salesService = inject(SalesService);
  private readonly chargesService = inject(ChargesService);
  protected readonly prefs = inject(PreferencesService);
  readonly objetsPret = OBJETS_PRET;
  readonly regimesFiscaux = REGIMES_FISCAUX;

  // Taux d'endettement indicatif couramment utilisé au Cameroun : la mensualité
  // d'un crédit ne devrait pas dépasser ~33% des revenus mensuels. Ce n'est
  // PAS une règle universelle — chaque banque applique ses propres critères.
  readonly TAUX_ENDETTEMENT_INDICATIF = 0.33;

  readonly etape = signal<Etape>(1);
  readonly typeDossier = signal<TypeDossier | null>(null);

  // --- Identification (commune) ---
  readonly raisonSociale = signal('');
  readonly activite = signal('');
  readonly adresse = signal('');
  readonly niu = signal('');
  readonly dateCreation = signal('');

  // --- Uniquement pour la déclaration fiscale ---
  readonly regimeFiscal = signal<RegimeFiscal | ''>('');
  readonly exerciceFiscal = signal(new Date().getFullYear().toString());
  readonly centreImpots = signal('');

  // --- Uniquement pour le prêt bancaire ---
  readonly capitalPropre = signal(0);
  readonly objetPret = signal('');
  readonly montantDemande = signal(0);
  readonly dureeMois = signal(12);
  readonly garanties = signal('');

  // --- Chiffre d'affaires (calculé, jamais saisi) ---
  readonly dureeHistorique = signal<6 | 12>(6);

  readonly genereEnCours = signal(false);
  readonly erreurGeneration = signal<string | null>(null);

  // Stock disponible = ce que le commerçant possède déjà en marchandises
  // (quantité × prix d'achat, issu du catalogue). Sert de preuve d'actif /
  // garantie potentielle pour un prêt — n'a aucun rapport avec la fiscalité.
  readonly stockDisponible = computed(() => {
    const liste = this.produitService.catalogue.value() ?? [];
    return liste.reduce((total, p) => total + p.quantiteStock * p.prixAchat, 0);
  });

  private readonly moisCouverts = computed(() => this.genererMoisCles(this.dureeHistorique()));

  // Chiffre d'affaires réel : agrège les ventes et charges enregistrées, mois par mois.
  // Formule : CA du mois = somme des `totalAmount` de toutes les ventes de ce mois.
  readonly historique = computed<LigneHistorique[]>(() => {
    const ventes = this.salesService.sales();
    const charges = this.chargesService.charges();

    return this.moisCouverts().map(({ cle, label }) => {
      const chiffreAffaires = ventes
        .filter((v) => v.date?.startsWith(cle))
        .reduce((s, v) => s + v.totalAmount, 0);
      const achatsCharges = charges
        .filter((c) => c.date.startsWith(cle))
        .reduce((s, c) => s + c.amount, 0);
      return { mois: label, chiffreAffaires, achatsCharges };
    });
  });

  readonly totalCA = computed(() => this.historique().reduce((s, l) => s + l.chiffreAffaires, 0));
  readonly totalAchats = computed(() => this.historique().reduce((s, l) => s + l.achatsCharges, 0));
  // CA − charges enregistrées dans Bilanko. Ce n'est PAS un résultat net
  // comptable officiel : il ne tient pas compte du salaire du commerçant,
  // des impôts, ni des charges non enregistrées dans le module Charges.
  readonly margeBrute = computed(() => this.totalCA() - this.totalAchats());
  readonly caMoyenMensuel = computed(() => Math.round(this.totalCA() / (this.historique().length || 1)));
  readonly maxCA = computed(() => Math.max(1, ...this.historique().map((l) => l.chiffreAffaires)));
  readonly moisSansVente = computed(() => this.historique().filter((l) => l.chiffreAffaires === 0).length);

  // --- Estimation indicative de capacité d'emprunt ---
  readonly capaciteRemboursementMensuelle = computed(() =>
    Math.round(this.caMoyenMensuel() * this.TAUX_ENDETTEMENT_INDICATIF)
  );
  readonly montantMaxIndicatif = computed(() =>
    Math.round(this.capaciteRemboursementMensuelle() * this.dureeMois())
  );
  readonly mensualiteEstimee = computed(() =>
    this.dureeMois() > 0 ? Math.round(this.montantDemande() / this.dureeMois()) : 0
  );
  readonly montantDepasseCapacite = computed(
    () =>
      this.typeDossier() === 'pret_bancaire' &&
      this.montantDemande() > 0 &&
      this.mensualiteEstimee() > this.capaciteRemboursementMensuelle()
  );

  // Pièces physiques à fournir (checklist affichée à l'écran uniquement, pas dans le PDF)
  readonly piecesAJoindre = computed(() => {
    const t = this.typeDossier();
    return t ? PIECES_A_JOINDRE[t] : [];
  });

  readonly peutContinuerEtape2 = computed(() => {
    const baseOk =
      !!this.raisonSociale().trim() &&
      !!this.activite().trim() &&
      !!this.adresse().trim() &&
      !!this.niu().trim() &&
      !!this.dateCreation();
    if (!baseOk) return false;

    if (this.typeDossier() === 'pret_bancaire') {
      // Les garanties ne sont volontairement PAS obligatoires : de nombreux
      // petits crédits (microfinance) s'obtiennent sans garantie formelle.
      // On n'empêche pas non plus de continuer si le montant dépasse la
      // capacité indicative — c'est une estimation, pas une règle bloquante.
      return this.montantDemande() > 0 && !!this.objetPret() && this.dureeMois() > 0;
    }
    if (this.typeDossier() === 'dsf_smt') {
      return !!this.regimeFiscal() && !!this.exerciceFiscal() && !!this.centreImpots().trim();
    }
    return false;
  });

  // On ne peut avancer que si des ventes réelles existent sur la période :
  // un dossier avec 0 FCFA de CA ne veut rien dire pour une banque ou le fisc.
  readonly peutContinuerEtape3 = computed(() => this.totalCA() > 0);

  readonly peutGenerer = computed(() => this.peutContinuerEtape2() && this.peutContinuerEtape3());

  choisirType(t: TypeDossier) {
    this.typeDossier.set(t);
  }

  etapeSuivante() {
    if (this.etape() === 1 && !this.typeDossier()) return;
    if (this.etape() === 2 && !this.peutContinuerEtape2()) return;
    if (this.etape() === 3 && !this.peutContinuerEtape3()) return;
    this.etape.update((e) => (e < 4 ? ((e + 1) as Etape) : e));
  }

  etapePrecedente() {
    this.etape.update((e) => (e > 1 ? ((e - 1) as Etape) : e));
  }

  allerA(e: Etape) {
    if (e >= 2 && !this.typeDossier()) return;
    if (e >= 3 && !this.peutContinuerEtape2()) return;
    if (e >= 4 && !this.peutContinuerEtape3()) return;
    this.etape.set(e);
  }

  changerDureeHistorique(duree: 6 | 12) {
    this.dureeHistorique.set(duree);
  }

  private genererMoisCles(duree: 6 | 12): { cle: string; label: string }[] {
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const maintenant = new Date();
    const resultat: { cle: string; label: string }[] = [];
    for (let i = duree - 1; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      resultat.push({ cle, label: `${moisNoms[d.getMonth()]} ${d.getFullYear()}` });
    }
    return resultat;
  }

genererDossier() {
  if (!this.peutGenerer() || !this.typeDossier()) return;

  const commercant: InfosCommercant = {
    raisonSociale: this.raisonSociale().trim(),
    activite: this.activite().trim(),
    adresse: this.adresse().trim(),
    niu: this.niu().trim(),
    regimeFiscal: this.typeDossier() === 'dsf_smt' ? (this.regimeFiscal() as RegimeFiscal) : undefined,
    dateCreation: this.dateCreation(),
  };

  const demande: DemandeDossier = {
    type: this.typeDossier()!,
    commercant,
    historique: this.historique(),
    dureeHistorique: this.dureeHistorique(),
    stockDisponible: this.stockDisponible(),
    pretBancaire: this.typeDossier() === 'pret_bancaire' ? {
      capitalPropre: Number(this.capitalPropre()),
      objetPret: this.objetPret(),
      montantDemande: Number(this.montantDemande()),
      dureeMois: Number(this.dureeMois()),
      garanties: this.garanties().trim(),
    } : undefined,
    dsf: this.typeDossier() === 'dsf_smt' ? {
      exerciceFiscal: this.exerciceFiscal(),
      centreImpots: this.centreImpots().trim(),
      chiffreAffairesAnnuelEstime: this.totalCA(),
    } : undefined,
  };

  this.genereEnCours.set(true);
  this.erreurGeneration.set(null);

  try {
    const blob = this.documentService.genererDossier(demande);
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    const suffixe = demande.type === 'pret_bancaire' ? 'demande-pret' : 'dsf-simplifiee';
    lien.href = url;
    lien.download = `bilanko-${suffixe}-${commercant.raisonSociale.replace(/\s+/g, '-').toLowerCase() || 'dossier'}.pdf`;
    lien.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Erreur génération dossier :', e);
    // ✅ Utiliser la traduction pour le message d'erreur
    this.erreurGeneration.set(this.prefs.t().generationError);
  } finally {
    this.genereEnCours.set(false);
  }
}
}