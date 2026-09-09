import { inject, Injectable, signal } from '@angular/core';
import { OverviewApiService } from '../../api/overview/overview-api.service';
import { OverviewSummary, SaleTimeSeriesPoint, TopSoldProduct } from '../../../models/overview';

@Injectable({
  providedIn: 'root',
})
export class OverviewStoreService {
  private readonly overviewApi = inject(OverviewApiService);

  readonly summary = signal<OverviewSummary | null>(null);
  readonly timeSeries = signal<SaleTimeSeriesPoint[]>([]);
  readonly topProducts = signal<TopSoldProduct[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly filterFrom = signal<string | undefined>(undefined);
  readonly filterTo = signal<string | undefined>(undefined);

  constructor() {
    void this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    const from = this.filterFrom();
    const to = this.filterTo();

    try {
      const [summaryRes, timeSeriesRes, topProductsRes] = await Promise.all([
        this.overviewApi.getSummary(from, to),
        this.overviewApi.getTimeSeries(from, to),
        this.overviewApi.getTopProducts(from, to),
      ]);

      this.summary.set(summaryRes);
      this.timeSeries.set(timeSeriesRes);
      this.topProducts.set(topProductsRes);
    } catch (err) {
      console.error('Erreur lors du chargement du tableau de bord :', err);
      this.error.set('Impossible de charger les données du tableau de bord.');
    } finally {
      this.isLoading.set(false);
    }
  }

  setPeriod(from?: string, to?: string): void {
    this.filterFrom.set(from);
    this.filterTo.set(to);
    void this.loadDashboardData();
  }
}
