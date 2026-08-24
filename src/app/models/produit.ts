export interface Produit {
  id: string;
  reference: string;
  nom: string;
  categorie: string;
  prixAchat: number;
  prixVente: number;
  quantiteStock: number;
  seuilAlerte: number;
}