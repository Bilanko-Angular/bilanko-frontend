import {Component, computed, inject, Input, signal} from '@angular/core';
import {ProduitService} from '../../../services/produit.service';
import {
  LigneHistorique,
  RegimeFiscal,
  TypeDossier
} from '../../../models/document-fiscal';
import {SalesService} from '../../../services/sales.service';
import {ChargesService} from '../../../services/charges.service';

@Component({
  selector: 'app-hero-bank',
  imports: [],
  templateUrl: './hero-bank.html',
  styleUrl: './hero-bank.css',
})
export class HeroBank {
  private readonly produitService = inject(ProduitService);
  private readonly salesService = inject(SalesService);
  private readonly chargesService = inject(ChargesService);

  readonly TAUX_ENDETTEMENT_INDICATIF = 0.33;
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
  readonly natureImpot = signal('');
  readonly periodeDeclaration = signal('');
  readonly montantImpot = signal(0);

  // --- Uniquement pour le prêt bancaire ---
  readonly banque = signal('');
  readonly agence = signal('');
  readonly objetPret = signal('');
  readonly montantDemande = signal(0);
  readonly dureeMois = signal(12);

  // --- Chiffre d'affaires (calculé, jamais saisi) ---
  readonly dureeHistorique = signal<6 | 12>(6);

  // Stock disponible = ce que le commerçant possède déjà en marchandises
  // (quantité × prix d'achat, issu du catalogue). NOTE : ceci ne bouge PAS
  // quand une vente est enregistrée ou supprimée — il n'existe actuellement
  // aucune liaison entre le module Ventes et le module Catalogue. Ce chiffre
  // reflète uniquement l'état du catalogue lui-même.
  readonly stockDisponible = computed(() => {
    const liste = this.produitService.catalogue.value() ?? [];
    return liste.reduce((total, p) => total + p.quantiteStock * p.prixAchat, 0);
  });

  private readonly moisCouverts = computed(() => this.genererMoisCles(this.dureeHistorique()));


  private extraireCleMois(date: unknown): string | null {
    if (!date) return null;

    // Objet Date natif — cas probable si le formulaire stocke un vrai Date
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return null;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Timestamp numérique
    if (typeof date === 'number') {
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    if (typeof date !== 'string') return null;
    const dateStr = date.trim();

    // ISO : "2026-08-15" ou "2026-08-15T10:30:00"
    let m = dateStr.match(/^(\d{4})-(\d{2})-\d{2}/);
    if (m) return `${m[1]}-${m[2]}`;

    // Français : "15/08/2026" ou "15/08/2026 10:30"
    m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2]}`;

    // Dernier recours : parsing natif du navigateur
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    }

    return null;
  }

  // Chiffre d'affaires réel : agrège les ventes et charges enregistrées, mois par mois.
  // Formule : CA du mois = somme des `totalAmount` de toutes les ventes de ce mois.
  readonly historique = computed<LigneHistorique[]>(() => {
    const ventes = this.salesService.sales();
    const charges = this.chargesService.charges();

    return this.moisCouverts().map(({ cle, label }) => {
      const chiffreAffaires = ventes
        .filter((v) => this.extraireCleMois(v.saleDate ?? v.date) === cle)
        .reduce((s, v) => s + v.totalAmount, 0);
      const achatsCharges = charges
        .filter((c) => this.extraireCleMois((c as any).date) === cle)
        .reduce((s, c) => s + c.amount, 0);
      return { mois: label, chiffreAffaires, achatsCharges };
    });
  });
  readonly totalCA = computed(() => this.historique().reduce((s, l) => s + l.chiffreAffaires, 0));
  readonly caMoyenMensuel = computed(() => Math.round(this.totalCA() / (this.historique().length || 1)));

  readonly capaciteRemboursementMensuelle = computed(() =>
    Math.round(this.caMoyenMensuel() * this.TAUX_ENDETTEMENT_INDICATIF)
  );

  readonly mensualiteEstimee = computed(() =>
    this.dureeMois() > 0 ? Math.round(this.montantDemande() / this.dureeMois()) : 0
  );

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

  @Input() etape=signal<Etape>(1)
}
