// src/app/models/sale.ts
export interface SaleItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitSellingPrice: number;
  unitPurchasePrice?: number;
  margin?: number;
}

export interface Sale {
  id: string;
  date?: string; // pour compatibilité avec l'ancien modèle
  saleDate: string; // ISO
  product?: string; // pour compatibilité avec l'ancien modèle
  quantity?: number; // pour compatibilité avec l'ancien modèle
  unitPrice?: number; // pour compatibilité avec l'ancien modèle
  totalAmount: number;
  totalMargin?: number;
  client?: string; // pour compatibilité avec l'ancien modèle
  customerName: string;
  items: SaleItem[];
}