import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import { ChargeRequestDTO, ChargeResponseDTO } from '../../../models/DTO/ChargeDto';

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

  /** Récupère toutes les charges de l'utilisateur courant — GET /api/charges */
  async getAllCharges(): Promise<ChargeResponseDTO[]> {
    const response = await apiClient.get<ChargeResponseDTO[]>(this.basePath);
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
