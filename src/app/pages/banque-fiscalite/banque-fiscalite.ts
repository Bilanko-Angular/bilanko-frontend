import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { DocumentStoreService } from '../../service/store/document/document-store.service';
import { Template } from '../../components/shared/template/template';
import {
  TypeDossier,
  InfosCommercant,
  DemandeDossier,
  LigneHistorique,
} from '../../models/document-fiscal';
import {
  CreateDocumentPretRequest,
  CreateDocumentFiscalRequest,
  InfoCleDTO,
} from '../../models/DTO/DocumentDto';
import { HeroBank } from '../../components/banque-fiscalite/hero-bank/hero-bank';
import { SelectTypeDocument } from '../../components/banque-fiscalite/select-type-document/select-type-document';
import { IdentificationMachand } from '../../components/banque-fiscalite/identification-machand/identification-machand';
import { CapitalFinancialNeeds } from '../../components/banque-fiscalite/capital-financial-needs/capital-financial-needs';
import { RevenueActivity } from '../../components/banque-fiscalite/revenue-activity/revenue-activity';
import { Summary } from '../../components/banque-fiscalite/summary/summary';
import { AsideBankFiscality } from '../../components/banque-fiscalite/aside-bank-fiscality/aside-bank-fiscality';
import { StepperDocument } from '../../components/banque-fiscalite/stepper-document/stepper-document';
import { FiscalityInformation } from '../../components/banque-fiscalite/fiscality-information/fiscality-information';

type Etape = 1 | 2 | 3 | 4;

/** Clé sessionStorage pour persister l'état du formulaire entre les rechargements */
const SESSION_KEY = 'bk-wizard-state';

interface WizardState {
  etape: Etape;
  typeDossier: TypeDossier | null;
  raisonSociale: string;
  activite: string;
  adresse: string;
  niu: string;
  dateCreation: string;
  /** Slugs catalogue (pas les libellés) */
  regimeFiscal: string;
  exerciceFiscal: string;
  centreImpots: string;
  natureImpot: string;
  periodeDeclaration: string;
  montantImpot: number;
  datePaiement: string;
  moyenPaiement: string;
  referencePaiement: string;
  capitalPropre: number;
  banque: string;
  agence: string;
  objetPret: string;
  montantDemande: number;
  dureeMois: number;
  garanties: string;
  dureeHistorique: 6 | 12;
}

@Component({
  selector: 'app-banque-fiscalite',
  standalone: true,
  imports: [
    FormsModule,
    Template,
    HeroBank,
    StepperDocument,
    SelectTypeDocument,
    IdentificationMachand,
    CapitalFinancialNeeds,
    FiscalityInformation,
    RevenueActivity,
    Summary,
    AsideBankFiscality,
  ],
  templateUrl: './banque-fiscalite.html',
  styleUrl: './banque-fiscalite.css',
})
export class BanqueFiscalite implements OnInit {
  // Service hérité (uniquement pour la génération du PDF local)
  private readonly documentService = inject(DocumentService);
  // Store lié au backend
  readonly documentStore = inject(DocumentStoreService);

  readonly TAUX_ENDETTEMENT_INDICATIF = 0.33;

  readonly etape = signal<Etape>(1);
  readonly typeDossier = signal<TypeDossier | null>(null);

  // --- Catalogues (provenant du backend) — nom affiché, slug envoyé ---
  readonly objetsPret = computed(() => this.documentStore.bootstrapData()?.objetsPret ?? []);
  readonly regimesFiscaux = computed(() => this.documentStore.bootstrapData()?.regimesFiscaux ?? []);
  readonly centresImpotsCatalogue = computed(
    () => this.documentStore.bootstrapData()?.centresImpots ?? []
  );
  readonly naturesImpotCatalogue = computed(
    () => this.documentStore.bootstrapData()?.naturesImpot ?? []
  );

  /** Libellé (nom) à partir d'un slug catalogue */
  nomDepuisSlug(items: readonly InfoCleDTO[], slug: string): string {
    return items.find(i => i.slug === slug)?.nom ?? slug;
  }

  readonly objetPretNom = computed(() =>
    this.nomDepuisSlug(this.objetsPret(), this.objetPret())
  );
  readonly regimeFiscalNom = computed(() =>
    this.nomDepuisSlug(this.regimesFiscaux(), this.regimeFiscal())
  );
  readonly centreImpotsNom = computed(() =>
    this.nomDepuisSlug(this.centresImpotsCatalogue(), this.centreImpots())
  );
  readonly natureImpotNom = computed(() =>
    this.nomDepuisSlug(this.naturesImpotCatalogue(), this.natureImpot())
  );

  // --- Identification (commune) ---
  readonly raisonSociale = signal('');
  readonly activite = signal('');
  readonly adresse = signal('');
  readonly niu = signal('');
  readonly dateCreation = signal('');
  readonly updateProfil = signal(true);

  // --- Déclaration fiscale (slugs catalogue) ---
  readonly regimeFiscal = signal('');
  readonly exerciceFiscal = signal(new Date().getFullYear().toString());
  readonly centreImpots = signal('');
  readonly natureImpot = signal('');
  readonly periodeDeclaration = signal('');
  readonly montantImpot = signal(0);
  readonly datePaiement = signal('');
  readonly moyenPaiement = signal('');
  readonly referencePaiement = signal('');

  // --- Prêt bancaire ---
  readonly capitalPropre = signal(0);
  readonly banque = signal('');
  readonly agence = signal('');
  readonly objetPret = signal('');
  readonly montantDemande = signal(0);
  readonly dureeMois = signal(12);
  readonly garanties = signal('');

  readonly dureeHistorique = signal<6 | 12>(6);
  readonly genereEnCours = signal(false);
  readonly erreurGeneration = signal<string | null>(null);

  // --- Données du store ---
  readonly stockDisponible = computed(() => this.documentStore.bootstrapData()?.stockDisponible ?? 0);

  readonly historique = computed<LigneHistorique[]>(() =>
    this.documentStore.historique().map(l => ({
      mois: l.mois,
      chiffreAffaires: l.chiffreAffaires,
      achatsCharges: l.achatsCharges,
    }))
  );

  readonly totalCA = computed(() => this.historique().reduce((s, l) => s + l.chiffreAffaires, 0));
  readonly totalAchats = computed(() => this.historique().reduce((s, l) => s + l.achatsCharges, 0));
  readonly margeBrute = computed(() => this.totalCA() - this.totalAchats());
  readonly caMoyenMensuel = computed(() => Math.round(this.totalCA() / (this.historique().length || 1)));
  readonly maxCA = computed(() => Math.max(1, ...this.historique().map(l => l.chiffreAffaires)));
  readonly moisSansVente = computed(() => this.historique().filter(l => l.chiffreAffaires === 0).length);

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

  readonly piecesAJoindre = computed(() => {
    const t = this.typeDossier();
    const map = this.documentStore.bootstrapData()?.piecesAJoindre;
    if (!t || !map) return [];
    const backendKey = t.toUpperCase();
    return map[backendKey] ?? map[t] ?? [];
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
      return (
        Number.isFinite(this.montantDemande()) &&
        this.montantDemande() > 0 &&
        !!this.banque().trim() &&
        !!this.agence().trim() &&
        !!this.objetPret().trim() &&
        Number.isFinite(this.dureeMois()) &&
        this.dureeMois() > 0
      );
    }
    if (this.typeDossier() === 'dsf_smt') {
      return (
        !!this.regimeFiscal() &&
        !!this.exerciceFiscal().trim() &&
        !!this.centreImpots().trim() &&
        !!this.natureImpot().trim() &&
        !!this.periodeDeclaration().trim() &&
        Number.isFinite(this.montantImpot()) &&
        this.montantImpot() >= 0
      );
    }
    return false;
  });

  readonly peutContinuerEtape3 = computed(() => this.totalCA() > 0);
  readonly peutGenerer = computed(() => this.peutContinuerEtape2() && this.peutContinuerEtape3());

  // ---------------------------------------------------------------
  // Persistance sessionStorage — auto-sauvegarde dès qu'un signal change
  // ---------------------------------------------------------------
  constructor() {
    effect(() => {
      const state: WizardState = {
        etape: this.etape(),
        typeDossier: this.typeDossier(),
        raisonSociale: this.raisonSociale(),
        activite: this.activite(),
        adresse: this.adresse(),
        niu: this.niu(),
        dateCreation: this.dateCreation(),
        regimeFiscal: this.regimeFiscal(),
        exerciceFiscal: this.exerciceFiscal(),
        centreImpots: this.centreImpots(),
        natureImpot: this.natureImpot(),
        periodeDeclaration: this.periodeDeclaration(),
        montantImpot: this.montantImpot(),
        datePaiement: this.datePaiement(),
        moyenPaiement: this.moyenPaiement(),
        referencePaiement: this.referencePaiement(),
        capitalPropre: this.capitalPropre(),
        banque: this.banque(),
        agence: this.agence(),
        objetPret: this.objetPret(),
        montantDemande: this.montantDemande(),
        dureeMois: this.dureeMois(),
        garanties: this.garanties(),
        dureeHistorique: this.dureeHistorique(),
      };
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch { /* rien */ }
    });
  }

  ngOnInit() {
    // 1. Restaurer depuis sessionStorage (avant le bootstrap pour ne pas écraser la saisie)
    this.restoreFromSession();

    // 2. Charger le bootstrap (catalogues + profil + historique)
    this.documentStore.loadBootstrap(this.dureeHistorique()).then(() => {
      const commercant = this.documentStore.bootstrapData()?.commercant;
      if (commercant) {
        // Pré-remplir seulement si le champ est encore vide (sessionStorage prioritaire)
        if (!this.raisonSociale() && commercant.raisonSociale) this.raisonSociale.set(commercant.raisonSociale);
        if (!this.activite() && commercant.activite) this.activite.set(commercant.activite);
        if (!this.adresse() && commercant.adresse) this.adresse.set(commercant.adresse);
        if (!this.niu() && commercant.niu) this.niu.set(commercant.niu);
        if (!this.dateCreation() && commercant.dateCreationActivite) this.dateCreation.set(commercant.dateCreationActivite);
      }
    });
  }

  private restoreFromSession(): void {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s: WizardState = JSON.parse(raw);
      if (s.etape) this.etape.set(s.etape);
      if (s.typeDossier) this.typeDossier.set(s.typeDossier);
      if (s.raisonSociale) this.raisonSociale.set(s.raisonSociale);
      if (s.activite) this.activite.set(s.activite);
      if (s.adresse) this.adresse.set(s.adresse);
      if (s.niu) this.niu.set(s.niu);
      if (s.dateCreation) this.dateCreation.set(s.dateCreation);
      if (s.regimeFiscal) this.regimeFiscal.set(s.regimeFiscal);
      if (s.exerciceFiscal) this.exerciceFiscal.set(s.exerciceFiscal);
      if (s.centreImpots) this.centreImpots.set(s.centreImpots);
      if (s.natureImpot) this.natureImpot.set(s.natureImpot);
      if (s.periodeDeclaration) this.periodeDeclaration.set(s.periodeDeclaration);
      if (s.montantImpot) this.montantImpot.set(s.montantImpot);
      if (s.datePaiement) this.datePaiement.set(s.datePaiement);
      if (s.moyenPaiement) this.moyenPaiement.set(s.moyenPaiement);
      if (s.referencePaiement) this.referencePaiement.set(s.referencePaiement);
      if (s.capitalPropre) this.capitalPropre.set(s.capitalPropre);
      if (s.banque) this.banque.set(s.banque);
      if (s.agence) this.agence.set(s.agence);
      if (s.objetPret) this.objetPret.set(s.objetPret);
      if (s.montantDemande) this.montantDemande.set(s.montantDemande);
      if (s.dureeMois) this.dureeMois.set(s.dureeMois);
      if (s.garanties) this.garanties.set(s.garanties);
      if (s.dureeHistorique) this.dureeHistorique.set(s.dureeHistorique);
    } catch { /* sessionStorage corrompu ou absent */ }
  }

  /** Effacer l'état sauvegardé (utile après génération réussie) */
  private clearSession(): void {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* rien */ }
  }

  // ---------------------------------------------------------------
  normaliserNombre(value: unknown): number {
    const nombre = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(nombre) ? nombre : 0;
  }

  choisirType(t: TypeDossier) { this.typeDossier.set(t); }

  etapeSuivante() {
    if (this.etape() === 1 && !this.typeDossier()) return;
    if (this.etape() === 2 && !this.peutContinuerEtape2()) return;
    if (this.etape() === 3 && !this.peutContinuerEtape3()) return;
    this.etape.update(e => (e < 4 ? ((e + 1) as Etape) : e));
  }

  etapePrecedente() {
    this.etape.update(e => (e > 1 ? ((e - 1) as Etape) : e));
  }

  allerA(e: Etape) {
    if (e >= 2 && !this.typeDossier()) return;
    if (e >= 3 && !this.peutContinuerEtape2()) return;
    if (e >= 4 && !this.peutContinuerEtape3()) return;
    this.etape.set(e);
  }

  changerDureeHistorique(duree: 6 | 12) {
    this.dureeHistorique.set(duree);
    this.documentStore.reloadHistorique(duree);
  }

  async genererDossier() {
    if (!this.peutGenerer() || !this.typeDossier()) return;

    this.genereEnCours.set(true);
    this.erreurGeneration.set(null);

    const infosCommercantPayload = {
      raisonSociale: this.raisonSociale().trim(),
      activite: this.activite().trim(),
      adresse: this.adresse().trim(),
      niu: this.niu().trim(),
      dateCreationActivite: this.dateCreation(),
    };

    let apiSuccess = false;

    try {
      if (this.typeDossier() === 'pret_bancaire') {
        const req: CreateDocumentPretRequest = {
          commercant: infosCommercantPayload,
          updateProfil: this.updateProfil(),
          objetPretSlug: this.objetPret(),
          banque: this.banque().trim(),
          agence: this.agence().trim(),
          capitalPropre: this.capitalPropre() > 0 ? Number(this.capitalPropre()) : undefined,
          montantDemande: Number(this.montantDemande()),
          dureeMois: Number(this.dureeMois()),
          garanties: this.garanties().trim() || undefined,
          dureeHistorique: this.dureeHistorique(),
        };
        const res = await this.documentStore.creerDocumentPret(req);
        if (res) apiSuccess = true;
      } else if (this.typeDossier() === 'dsf_smt') {
        const req: CreateDocumentFiscalRequest = {
          commercant: infosCommercantPayload,
          updateProfil: this.updateProfil(),
          regimeFiscal: this.regimeFiscal(),
          exerciceFiscal: this.exerciceFiscal(),
          centreImpots: this.centreImpots(),
          natureImpot: this.natureImpot(),
          debutPeriodeDeclaration: this.periodeDeclaration().trim(),
          finPeriodeDeclaration: this.periodeDeclaration().trim(),
          montantImpot: this.montantImpot().toString(),
          datePaiement: this.datePaiement() || undefined,
          moyenPaiement: this.moyenPaiement() || undefined,
          referencePaiement: this.referencePaiement().trim() || undefined,
          chiffreAffairesPeriode: this.totalCA(),
          dureeHistorique: this.dureeHistorique(),
        };
        const res = await this.documentStore.creerDocumentFiscal(req);
        if (res) apiSuccess = true;
      }

      if (!apiSuccess) {
        // Afficher le détail de l'erreur backend s'il est disponible
        const detail = this.documentStore.errorDetail();
        this.erreurGeneration.set(
          detail
            ? `Erreur serveur : ${detail}`
            : 'La création du dossier a échoué côté serveur. Vérifiez les informations saisies.'
        );
        this.genereEnCours.set(false);
        return;
      }

      // -- Génération du PDF local (fallback UX actuel) --
      const commercant: InfosCommercant = {
        raisonSociale: this.raisonSociale().trim(),
        activite: this.activite().trim(),
        adresse: this.adresse().trim(),
        niu: this.niu().trim(),
        regimeFiscal:
          this.typeDossier() === 'dsf_smt' ? this.regimeFiscalNom() : undefined,
        dateCreation: this.dateCreation(),
      };

      const demande: DemandeDossier = {
        type: this.typeDossier()!,
        commercant,
        historique: this.historique(),
        dureeHistorique: this.dureeHistorique(),
        stockDisponible: this.stockDisponible(),
        pretBancaire:
          this.typeDossier() === 'pret_bancaire'
            ? {
                banque: this.banque().trim(),
                agence: this.agence().trim(),
                capitalPropre: Number(this.capitalPropre()),
                // PDF : libellé lisible (nom), pas le slug
                objetPret: this.objetPretNom(),
                montantDemande: Number(this.montantDemande()),
                dureeMois: Number(this.dureeMois()),
                garanties: this.garanties().trim(),
              }
            : undefined,
        dsf:
          this.typeDossier() === 'dsf_smt'
            ? {
                exerciceFiscal: this.exerciceFiscal(),
                // PDF : libellés (nom)
                centreImpots: this.centreImpotsNom(),
                natureImpot: this.natureImpotNom(),
                periodeDeclaration: this.periodeDeclaration().trim(),
                montantImpot: Number(this.montantImpot()),
                datePaiement: this.datePaiement(),
                moyenPaiement: this.moyenPaiement(),
                referencePaiement: this.referencePaiement().trim(),
                chiffreAffairesPeriode: this.totalCA(),
              }
            : undefined,
      };

      const blob = await this.documentService.genererDossier(demande);
      const url = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      const suffixe = demande.type === 'pret_bancaire' ? 'demande-pret' : 'dsf-simplifiee';
      lien.href = url;
      lien.download = `bilanko-${suffixe}-${commercant.raisonSociale.replace(/\s+/g, '-').toLowerCase() || 'dossier'}.pdf`;
      lien.click();
      URL.revokeObjectURL(url);

      // Succès complet : on efface la session pour repartir proprement
      this.clearSession();

    } catch (e) {
      console.error('Erreur génération dossier :', e);
      this.erreurGeneration.set('La génération locale du PDF a échoué. Le dossier a été enregistré sur le serveur.');
    } finally {
      this.genereEnCours.set(false);
    }
  }
}
