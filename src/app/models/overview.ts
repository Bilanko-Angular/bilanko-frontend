export interface StockOverview {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
}

export interface OverviewSummary {
  revenue: number;
  grossMargin: number;
  totalCharges: number;
  netProfit: number;
  salesCount: number;
  chargesCount: number;
  stock: StockOverview;
  from?: string;
  to?: string;
}

export interface SaleTimeSeriesPoint {
  date: string;
  revenue: number;
  salesCount: number;
}

export interface TopSoldProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}