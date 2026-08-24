import { Produit } from "../produit";
import { StockStatus } from "../Type/StockStatus";

export interface CategoryDto {
  id: number;
  name: string;
}

export interface ProductApiDto {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  purchasePrice: number;
  categories: CategoryDto[];
  reference: string;
  alertThreshold: number;
  createdAt: string; 
}

export interface SearchProduitParams {
  search?: string;
  categoryId?: number;
  stockStatus?: 'tous' | StockStatus;
  page?: number; // 0-indexée
  size?: number;
}

export interface PagedProduits {
  produits: Produit[];
  totalElements: number;
  totalPages: number;
  page: number;
}