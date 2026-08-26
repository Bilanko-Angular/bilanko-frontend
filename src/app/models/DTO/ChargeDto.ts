// Request DTO — correspond au ChargeRequestDTO du backend
export interface ChargeRequestDTO {
  label: string;
  supplier: string;
  amount: number;
  date: string; // ISO date string (YYYY-MM-DD), mappé vers LocalDate côté Java
}

// Response DTO — correspond au ChargeResponseDTO du backend
export interface ChargeResponseDTO {
  id: number;
  label: string;
  supplier: string;
  amount: number;
  date: string; // ISO date string retourné par le backend
}
