export interface TypeDocumentDTO {
  id: string;
  label: string;
}

export interface InfoCleDTO {
  id: string;
  label: string;
}

export interface RegimeFiscalDTO {
  id: string;
  label: string;
}

export interface InfosCommercantDTO {
  raisonSociale: string;
  activite: string;
  adresse: string;
  niu: string;
  dateCreationActivite: string;
}

export interface LigneHistoriqueDTO {
  cle: string;
  mois: string;
  chiffreAffaires: number;
  achatsCharges: number;
}

export interface DocumentBootstrapDTO {
  typesDocument: TypeDocumentDTO[];
  objetsPret: InfoCleDTO[];
  regimesFiscaux: RegimeFiscalDTO[];
  centresImpots: InfoCleDTO[];
  naturesImpot: InfoCleDTO[];
  piecesAJoindre: Record<string, InfoCleDTO[]>;
  montantImpotDefaut: number;
  commercant: InfosCommercantDTO;
  stockDisponible: number;
  dureeHistoriqueDefaut: number;
  historique: LigneHistoriqueDTO[];
}

export interface DocumentPretDetails {
  capitalPropre: number;
  banque: string;
  agence: string;
  montantDemande: number;
  dureeMois: number;
  garanties: string;
}

export interface DocumentFiscalDetails {
  regimeFiscal: string;
  regimeFiscalFrontCode: string;
  exerciceFiscal: string;
  centreImpots: string;
  natureImpot: string;
  debutPeriodeDeclaration: string;
  finPeriodeDeclaration: string;
  montantImpot: string;
  datePaiement: string;
  moyenPaiement: string;
  referencePaiement: string;
  chiffreAffairesPeriode: number;
}

export interface DocumentResponseDTO {
  id: number;
  nom: string;
  type: string; // TypeDocument enum en Java (ex: "PRET_BANCAIRE", "DSF_SMT")
  frontCode: string;
  objet: string;
  dateDeGeneration: string;
  raisonSociale: string;
  infoCles: InfoCleDTO[];
  pret?: DocumentPretDetails;
  fiscal?: DocumentFiscalDetails;
}

export interface InfosCommercantPayload {
  raisonSociale: string;
  activite: string;
  adresse: string;
  niu: string;
  dateCreationActivite: string;
}

export interface CreateDocumentPretRequest {
  nom?: string;
  commercant: InfosCommercantPayload;
  updateProfil: boolean;
  objetPretSlug: string;
  banque: string;
  agence: string;
  capitalPropre?: number;
  montantDemande: number;
  dureeMois: number;
  garanties?: string;
  dureeHistorique?: number;
}

export interface CreateDocumentFiscalRequest {
  nom?: string;
  commercant: InfosCommercantPayload;
  updateProfil: boolean;
  regimeFiscal: string;
  exerciceFiscal: string;
  centreImpots: string;
  natureImpot: string;
  debutPeriodeDeclaration: string;
  finPeriodeDeclaration: string;
  montantImpot: string;
  datePaiement?: string;
  moyenPaiement?: string;
  referencePaiement?: string;
  chiffreAffairesPeriode?: number;
  dureeHistorique?: number;
}
