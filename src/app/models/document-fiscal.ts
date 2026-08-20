export type TypeDocumentFiscal = 'bilan' | 'compte-resultat' | 'liasse-fiscale' | 'grand-livre';

export interface DocumentFiscalOption {
  id: TypeDocumentFiscal;
  titre: string;
  description: string;
}

export const DOCUMENTS_DISPONIBLES: DocumentFiscalOption[] = [
  { id: 'bilan', titre: 'Bilan Comptable Détaillé', description: 'Actif, passif et annexes comptables.' },
  { id: 'compte-resultat', titre: 'Compte de Résultat', description: 'Exercice N et N-1 avec comparatif.' },
  { id: 'liasse-fiscale', titre: 'Liasse Fiscale (Modèle Normal)', description: 'Cerfa complet pour télédéclaration.' },
  { id: 'grand-livre', titre: 'Grand Livre des Tiers', description: 'Détail des comptes clients et fournisseurs.' },
];

export interface DemandeDossierFiscal {
  documents: TypeDocumentFiscal[];
  format: 'A4' | 'Legal';
  periodeDebut: string;
  periodeFin: string;
}