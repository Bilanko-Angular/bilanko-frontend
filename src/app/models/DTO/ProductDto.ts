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