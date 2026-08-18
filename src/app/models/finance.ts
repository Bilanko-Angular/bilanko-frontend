export interface Sale {
  id: string;
  date: string; // ISO date
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  client?: string;
}

export interface Charge {
  id: string;
  date: string; // ISO date
  label: string;
  category?: string;
  amount: number;
  supplier?: string;
  paymentMethod?: string;
  notes?: string;
}
