/** Correspond à SaleItemRequestDTO du backend */
export interface SaleItemRequestDTO {
  productId: number;
  quantity: number;
  unitSellingPrice?: number | null;
}

/** Correspond à SaleRequestDTO du backend */
export interface SaleRequestDTO {
  saleDate: string; // ISO LocalDateTime
  customerName: string;
  items: SaleItemRequestDTO[];
}

/** Correspond à SaleItemResponseDTO du backend */
export interface SaleItemResponseDTO {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitSellingPrice: number;
  unitPurchasePrice: number;
  margin: number;
}

/** Correspond à SaleResponseDTO du backend */
export interface SaleResponseDTO {
  id: number;
  saleDate: string; // ISO LocalDateTime
  customerName: string;
  totalAmount: number;
  totalMargin: number;
  items: SaleItemResponseDTO[];
}

/** Correspond à SaleSummaryDTO du backend */
export interface SaleSummaryDTO {
  salesCount: number;
  totalAmount: number;
  totalMargin: number;
  from: string | null;
  to: string | null;
}
