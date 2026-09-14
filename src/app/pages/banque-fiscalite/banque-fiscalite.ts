import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { DocumentStoreService } from '../../service/store/document/document-store.service';
import { Template } from '../../components/shared/template/template';
import {
  TypeDossier,
  RegimeFiscal,
  InfosCommercant,
  DemandeDossier,
  LigneHistorique,
} from '../../models/document-fiscal';
import { CreateDocumentPretRequest, CreateDocumentFiscalRequest, RegimeFiscalDTO } from '../../models/DTO/DocumentDto';
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
  // Service hérité (uniquement pour la génération du PDF local en attendant que le backend s'en charge)
  private readonly documentService = inject(DocumentService);
  // Nouveau service de gestion d'état lié au backend
  readonly documentStore = inject(DocumentStoreService);

  readonly TAUX_ENDETTEMENT_INDICATIF = 0.33;

  readonly etape = signal<Etape>(1);
  readonly typeDossier = signal<TypeDossier | null>(null);

  // --- Catalogues (provenant du backend) ---
  readonly objetsPret = computed(() => this.documentStore.bootstrapData()?.objetsPret ?? []);
  readonly regimesFiscaux = computed(() => this.documentStore.bootstrapData()?.regimesFiscaux ?? []);
  
  // Le front utilise des strings pour RegimeFiscal au lieu d'un objet id/label
  // On mappe les regimesFiscaux DTO vers le format attendu par le frontend si besoin.
  readonly regimesFiscauxFront = computed(() => {
    return this.regimesFiscaux().map((r: RegimeFiscalDTO) => ({ id: r.id as RegimeFiscal, label: r.label }));
  });

  // --- Identification (commune) ---
  readonly raisonSociale = signal('');
  readonly activite = signal('');
  readonly adresse = signal('');
  readonly niu = signal('');
  readonly dateCreation = signal('');
  // Option pour mettre à jour le profil avec ces données
  readonly updateProfil = signal(true);

  // --- Uniquement pour la déclaration fiscale ---
  readonly regimeFiscal = signal<RegimeFiscal | ''>('');
  readonly exerciceFiscal = signal(new Date().getFullYear().toString());
  readonly centreImpots = signal('');
  readonly natureImpot = signal('');
  readonly periodeDeclaration = signal('');
  readonly montantImpot = signal(0);
  readonly datePaiement = signal('');
  readonly moyenPaiement = signal('');
  readonly referencePaiement = signal('');

  // --- Uniquement pour le prêt bancaire ---
  readonly capitalPropre = signal(0);
  readonly banque = signal('');
  readonly agence = signal('');
  readonly objetPret = signal('');
  readonly montantDemande = signal(0);
  readonly dureeMois = signal(12);
  readonly garanties = signal('');

  normaliserNombre(value: unknown): number {
    const nombre = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(nombre) ? nombre : 0;
  }

  // --- Chiffre d'affaires ---
  readonly dureeHistorique = signal<6 | 12>(6);

  readonly genereEnCours = signal(false);
  readonly erreurGeneration = signal<string | null>(null);

  // Valeur issue du bootstrap
  readonly stockDisponible = computed(() => this.documentStore.bootstrapData()?.stockDisponible ?? 0);

  // Historique issu du Store (et donc du backend)
  readonly historique = computed<LigneHistorique[]>(() => {
    const lignes = this.documentStore.historique();
    return lignes.map(l => ({
      mois: l.mois,
      chiffreAffaires: l.chiffreAffaires,
      achatsCharges: l.achatsCharges
    }));
  });

  readonly totalCA = computed(() => this.historique().reduce((s, l) => s + l.chiffreAffaires, 0));
  readonly totalAchats = computed(() => this.historique().reduce((s, l) => s + l.achatsCharges, 0));
  readonly margeBrute = computed(() => this.totalCA() - this.totalAchats());
  readonly caMoyenMensuel = computed(() => Math.round(this.totalCA() / (this.historique().length || 1)));
  readonly maxCA = computed(() => Math.max(1, ...this.historique().map((l) => l.chiffreAffaires)));
  readonly moisSansVente = computed(() => this.historique().filter((l) => l.chiffreAffaires === 0).length);

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
    
    // Le typeDossier front est "pret_bancaire" ou "dsf_smt"
    // Le backend utilise des clés enum "PRET_BANCAIRE", "DSF_SMT"
    const backendKey = t.toUpperCase();
    return map[backendKey] || map[t] || [];
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

  ngOnInit() {
    // Charger le bootstrap via le store (catalogues + infos profil utilisateur)
    this.documentStore.loadBootstrap(this.dureeHistorique()).then(() => {
      const commercant = this.documentStore.bootstrapData()?.commercant;
      if (commercant) {
        // Préremplir avec les données du backend si les champs sont vides
        if (!this.raisonSociale() && commercant.raisonSociale) this.raisonSociale.set(commercant.raisonSociale);
        if (!this.activite() && commercant.activite) this.activite.set(commercant.activite);
        if (!this.adresse() && commercant.adresse) this.adresse.set(commercant.adresse);
        if (!this.niu() && commercant.niu) this.niu.set(commercant.niu);
        if (!this.dateCreation() && commercant.dateCreationActivite) this.dateCreation.set(commercant.dateCreationActivite);
      }
    });
  }

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
          capitalPropre: Number(this.capitalPropre()),
          montantDemande: Number(this.montantDemande()),
          dureeMois: Number(this.dureeMois()),
          garanties: this.garanties().trim(),
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
          centreImpots: this.centreImpots().trim(),
          natureImpot: this.natureImpot().trim(),
          debutPeriodeDeclaration: this.periodeDeclaration().trim(), // Le back attend debut et fin
          finPeriodeDeclaration: this.periodeDeclaration().trim(),   // temporaire si le front n'a qu'un champ
          montantImpot: this.montantImpot().toString(),
          datePaiement: this.datePaiement(),
          moyenPaiement: this.moyenPaiement(),
          referencePaiement: this.referencePaiement().trim(),
          chiffreAffairesPeriode: this.totalCA(),
          dureeHistorique: this.dureeHistorique(),
        };
        const res = await this.documentStore.creerDocumentFiscal(req);
        if (res) apiSuccess = true;
      }
      
      if (!apiSuccess) {
        this.erreurGeneration.set('La génération du dossier a échoué via le serveur. Vérifiez les informations.');
        this.genereEnCours.set(false);
        return;
      }

      // -- Génération PDF local en fallback pour l'UX existante --
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
        pretBancaire:
          this.typeDossier() === 'pret_bancaire'
            ? {
                banque: this.banque().trim(),
                agence: this.agence().trim(),
                capitalPropre: Number(this.capitalPropre()),
                objetPret: this.objetPret(),
                montantDemande: Number(this.montantDemande()),
                dureeMois: Number(this.dureeMois()),
                garanties: this.garanties().trim(),
              }
            : undefined,
        dsf:
          this.typeDossier() === 'dsf_smt'
            ? {
                exerciceFiscal: this.exerciceFiscal(),
                centreImpots: this.centreImpots().trim(),
                natureImpot: this.natureImpot().trim(),
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
    } catch (e) {
      console.error('Erreur génération dossier :', e);
      this.erreurGeneration.set('La génération locale du PDF a échoué.');
    } finally {
      this.genereEnCours.set(false);
    }
  }
}
