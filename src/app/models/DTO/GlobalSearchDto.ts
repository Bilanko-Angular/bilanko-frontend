import type { ProductApiDto } from './ProductDto';
import type { SaleResponseDTO } from './SaleDto';
import type { ChargeResponseDTO } from './ChargeDto';

export type GlobalSearchResultType = 'PRODUCT' | 'SALE' | 'CHARGE' | 'URL' | 'PARAM';

export interface GlobalSearchResultDTO {
  type: GlobalSearchResultType | string;
  id: number;
  data: ProductApiDto | SaleResponseDTO | ChargeResponseDTO | NavigationSearchData | unknown;
}

export interface NavigationSearchData {
  url?: string;
  path?: string;
  label?: string;
  title?: string;
  section?: string;
  parameter?: string;
}
