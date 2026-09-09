import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import type {
  SaleRequestDTO,
  SaleResponseDTO,
  SaleSummaryDTO,
} from '../../../models/DTO/SaleDto';

@Injectable({
  providedIn: 'root',
})
export class VenteApiService {
  private readonly basePath = environment.baseApiUrl + '/sales';

  /** Crée une vente — POST /api/sales */
  async createSale(dto: SaleRequestDTO): Promise<SaleResponseDTO> {
    const response = await apiClient.post<SaleResponseDTO>(this.basePath, dto);
    return response.data;
  }

  /** Liste les ventes (filtre optionnel par période) — GET /api/sales */
  async getAllSales(from?: string, to?: string): Promise<SaleResponseDTO[]> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    const response = await apiClient.get<SaleResponseDTO[]>(this.basePath, { params });
    return response.data;
  }

  /** Résumé des ventes — GET /api/sales/summary */
  async getSummary(from?: string, to?: string): Promise<SaleSummaryDTO> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    const response = await apiClient.get<SaleSummaryDTO>(`${this.basePath}/summary`, { params });
    return response.data;
  }

  /** Recherche par mot-clé — GET /api/sales/search?keyword= */
  async searchSales(keyword: string): Promise<SaleResponseDTO[]> {
    const response = await apiClient.get<SaleResponseDTO[]>(`${this.basePath}/search`, {
      params: { keyword },
    });
    return response.data;
  }

  /** Détail d'une vente — GET /api/sales/{id} */
  async getSaleById(id: number): Promise<SaleResponseDTO> {
    const response = await apiClient.get<SaleResponseDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  /** Met à jour une vente — PUT /api/sales/{id} */
  async updateSale(id: number, dto: SaleRequestDTO): Promise<SaleResponseDTO> {
    const response = await apiClient.put<SaleResponseDTO>(`${this.basePath}/${id}`, dto);
    return response.data;
  }

  /** Supprime une vente — DELETE /api/sales/{id} */
  async deleteSale(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
