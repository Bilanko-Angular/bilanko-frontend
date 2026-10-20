// Request DTO — correspond au ChargeRequestDTO du backend
export interface ChargeRequestDTO {
  label: string;
  supplier: string;
  amount: number;
  date: string;      // ISO date string (YYYY-MM-DD), mappé vers LocalDate côté Java
  categoryId?: number; // Optionnel — associe la charge à une catégorie
}

// Response DTO — correspond au ChargeResponseDTO du backend
export interface ChargeResponseDTO {
  id: number;
  label: string;
  supplier: string;
  amount: number;
  date: string; // ISO date string retourné par le backend
  categoryId?: number;
  categoryName?: string;
}

// Summary DTO — correspond au ChargeSummaryDTO retourné par GET /api/charges/summary
export interface ChargeSummaryDTO {
  totalAmount: number;
  count: number;
  averageAmount: number;
}

// Paramètres de pagination + filtre de période pour GET /api/charges
export interface ChargeFilterParams {
  from?: string;  // ISO date YYYY-MM-DD
  to?: string;    // ISO date YYYY-MM-DD
  page?: number;
  size?: number;
}

// Paramètres de recherche avancée pour GET /api/charges/search
export interface ChargeSearchParams {
  label?: string;
  supplier?: string;
  minAmount?: number;
  maxAmount?: number;
  date?: string; // ISO date YYYY-MM-DD
  page?: number;
  size?: number;
}
