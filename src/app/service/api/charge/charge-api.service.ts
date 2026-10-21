import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import {
  ChargeRequestDTO,
  ChargeResponseDTO,
  ChargeSummaryDTO,
  ChargeUserSummary,
  ChargeFilterParams,
  ChargeSearchParams,
} from '../../../models/DTO/ChargeDto';
import { PagedResponseDto } from '../../../models/DTO/response/PageResponse';

@Injectable({
  providedIn: 'root',
})
export class ChargeApiService {
  private readonly basePath = environment.baseApiUrl + '/charges';

  /** Crée une nouvelle charge — POST /api/charges */
  async createCharge(dto: ChargeRequestDTO): Promise<ChargeResponseDTO> {
    const response = await apiClient.post<ChargeResponseDTO>(this.basePath, dto);
    return response.data;
  }

  /**
   * Récupère toutes les charges (paginées) de l'utilisateur courant
   * GET /api/charges?from=&to=&page=&size=
   */
  async getAllCharges(params: ChargeFilterParams = {}): Promise<PagedResponseDto<ChargeResponseDTO>> {
    const response = await apiClient.get<PagedResponseDto<ChargeResponseDTO>>(this.basePath, {
      params: {
        ...(params.from   && { from: params.from }),
        ...(params.to     && { to: params.to }),
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return response.data;
  }

  /**
   * Recherche avancée de charges
   * GET /api/charges/search?label=&supplier=&minAmount=&maxAmount=&date=&page=&size=
   */
  async searchCharges(params: ChargeSearchParams): Promise<PagedResponseDto<ChargeResponseDTO>> {
    const response = await apiClient.get<PagedResponseDto<ChargeResponseDTO>>(
      `${this.basePath}/search`,
      {
        params: {
          ...(params.label      && { label: params.label }),
          ...(params.supplier   && { supplier: params.supplier }),
          ...(params.minAmount  !== undefined && { minAmount: params.minAmount }),
          ...(params.maxAmount  !== undefined && { maxAmount: params.maxAmount }),
          ...(params.date       && { date: params.date }),
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }
    );
    return response.data;
  }

  /**
   * Récupère le résumé financier des charges
   * GET /api/charges/summary?from=&to=
   */
  async getSummary(from?: string, to?: string): Promise<ChargeSummaryDTO> {
    const response = await apiClient.get<ChargeSummaryDTO>(`${this.basePath}/summary`, {
      params: {
        ...(from && { from }),
        ...(to   && { to }),
      },
    });
    return response.data;
  }

  /** Résumé des charges de l'utilisateur — GET /api/charges/user-summary */
  async getUserSummary(): Promise<ChargeUserSummary> {
    const response = await apiClient.get<ChargeUserSummary>(`${this.basePath}/user-summary`);
    return response.data;
  }

  /** Récupère une charge par son id — GET /api/charges/{id} */
  async getChargeById(id: number): Promise<ChargeResponseDTO> {
    const response = await apiClient.get<ChargeResponseDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  /** Met à jour une charge — PUT /api/charges/{id} */
  async updateCharge(id: number, dto: ChargeRequestDTO): Promise<ChargeResponseDTO> {
    const response = await apiClient.put<ChargeResponseDTO>(`${this.basePath}/${id}`, dto);
    return response.data;
  }

  /** Supprime une charge — DELETE /api/charges/{id} */
  async deleteCharge(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
