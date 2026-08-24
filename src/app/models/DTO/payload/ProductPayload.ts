export interface CreateProduitPayload {
  nom: string;
  quantiteStock: number;
  prixVente: number;
  prixAchat: number;
  seuilAlerte?: number;
  idCategories?: number[];
}

export interface UpdateProduitPayload {
  nom?: string;
  quantiteStock?: number;
  prixVente?: number;
  prixAchat?: number;
  seuilAlerte?: number;
  idCategories?: number[];
}