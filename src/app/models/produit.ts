export interface Produit {
  id: string;
  reference: string;
  nom: string;
  categorie: string;
  prixAchat: number;
  quantiteStock: number;
  seuilAlerte: number;
}