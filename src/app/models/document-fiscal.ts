export type TypeDossier = 'pret_bancaire' | 'dsf_smt';

export type RegimeFiscal = 'contribution_liberatoire' | 'reel_simplifie' | 'reel';

export interface InfosCommercant {
  raisonSociale: string;
  activite: string;
  adresse: string;
  niu: string; // Numéro d'Identifiant Unique — numéro fiscal délivré par la DGI
  regimeFiscal?: RegimeFiscal; // uniquement pertinent pour la déclaration fiscale, pas pour un prêt
  dateCreation: string;
}

export interface InfosPretBancaire {
  capitalPropre: number;
  objetPret: string;
  montantDemande: number;
  dureeMois: number;
  garanties: string;
}

export interface InfosDsf {
  exerciceFiscal: string;
  centreImpots: string;
  chiffreAffairesAnnuelEstime: number;
}

export interface LigneHistorique {
  mois: string;
  chiffreAffaires: number;
  achatsCharges: number;
}

export interface DemandeDossier {
  type: TypeDossier;
  commercant: InfosCommercant;
  historique: LigneHistorique[];
  dureeHistorique: 6 | 12;
  stockDisponible: number;
  pretBancaire?: InfosPretBancaire;
  dsf?: InfosDsf;
}

export const OBJETS_PRET: string[] = [
  'Fonds de roulement',
  'Achat de marchandises / stock',
  "Achat de matériel / équipement",
  'Extension / nouveau point de vente',
  'Rénovation du local',
  'Autre besoin',
];

export const REGIMES_FISCAUX: { id: RegimeFiscal; label: string }[] = [
  { id: 'contribution_liberatoire', label: 'Contribution Libératoire (CA < 10M FCFA/an)' },
  { id: 'reel_simplifie', label: 'Régime Simplifié — Système Minimal de Trésorerie (SMT)' },
  { id: 'reel', label: 'Régime du Réel' },
];

// Pièces physiques que le commerçant doit préparer lui-même — affichées
// uniquement à l'écran (étape 4) comme checklist, jamais dans le PDF final :
// la banque connaît déjà ses propres exigences documentaires.
export const PIECES_A_JOINDRE: Record<TypeDossier, string[]> = {
  pret_bancaire: [
    "Carte Nationale d'Identité (CNI) du commerçant, en cours de validité",
    'Registre de Commerce (RCCM), si vous en disposez',
    'Relevés de compte bancaire des 3 à 6 derniers mois',
    "Devis ou facture pro forma si le prêt finance un achat précis (matériel, marchandises...)",
    'Justificatif de localisation du commerce',
  ],
  dsf_smt: [
    "Carte Nationale d'Identité (CNI) du commerçant, en cours de validité",
    'Registre de Commerce (RCCM), si vous en disposez',
    'Justificatif de localisation du commerce',
    'Numéro Contribuable / NIU (déjà indiqué dans ce dossier)',
  ],
};