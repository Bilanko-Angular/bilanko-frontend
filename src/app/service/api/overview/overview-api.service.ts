import { Injectable } from '@angular/core';
import { OverviewSummary, SaleTimeSeriesPoint, TopSoldProduct } from '../../../models/overview';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OverviewApiService {
  private readonly basePath = `${environment.baseApiUrl}/overview`;

  async getSummary(from?: string, to?: string): Promise<OverviewSummary> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    const response = await apiClient.get<OverviewSummary>(`${this.basePath}/summary`, { params });
    return response.data;
  }

  async getTimeSeries(from?: string, to?: string, granularity = 'day'): Promise<SaleTimeSeriesPoint[]> {
    const params: Record<string, string> = { granularity };
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    const response = await apiClient.get<SaleTimeSeriesPoint[]>(`${environment.baseApiUrl}/sales/timeseries`, { params });
    return response.data;
  }

  async getTopProducts(from?: string, to?: string, limit = 5, sortBy = 'quantity'): Promise<TopSoldProduct[]> {
    const params: Record<string, string | number> = { limit, sortBy };
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    const response = await apiClient.get<TopSoldProduct[]>(`${environment.baseApiUrl}/sales/top-products`, { params });
    return response.data;
  }
}
