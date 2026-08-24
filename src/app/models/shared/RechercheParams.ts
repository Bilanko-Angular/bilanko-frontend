
export interface RechercheParams {
  search?: string;
  categoryId?: number;
  stockStatus?: 'tous' | 'ok' | 'warning' | 'error';
  page?: number;
}