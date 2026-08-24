export interface Charge {
  id: string;
  date: string;
  label: string;
  category?: string;
  amount: number;
  supplier?: string;
  paymentMethod?: string;
  notes?: string;
}