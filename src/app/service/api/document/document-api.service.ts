import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { apiClient } from '../../../core/axios/axios.config';
import {
  DocumentBootstrapDTO,
  LigneHistoriqueDTO,
  DocumentResponseDTO,
  CreateDocumentPretRequest,
  CreateDocumentFiscalRequest,
} from '../../../models/DTO/DocumentDto';

@Injectable({
  providedIn: 'root',
})
export class DocumentApiService {
  private readonly basePath = `${environment.baseApiUrl}/documents`;

  async getBootstrap(dureeHistorique: number = 6): Promise<DocumentBootstrapDTO> {
    const response = await apiClient.get<DocumentBootstrapDTO>(`${this.basePath}/bootstrap`, {
      params: { dureeHistorique },
    });
    return response.data;
  }

  async getHistorique(dureeHistorique: number = 6): Promise<LigneHistoriqueDTO[]> {
    const response = await apiClient.get<LigneHistoriqueDTO[]>(`${this.basePath}/historique`, {
      params: { dureeHistorique },
    });
    return response.data;
  }

  async listMine(): Promise<DocumentResponseDTO[]> {
    const response = await apiClient.get<DocumentResponseDTO[]>(this.basePath);
    return response.data;
  }

  async getById(id: number): Promise<DocumentResponseDTO> {
    const response = await apiClient.get<DocumentResponseDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createPret(request: CreateDocumentPretRequest): Promise<DocumentResponseDTO> {
    const response = await apiClient.post<DocumentResponseDTO>(`${this.basePath}/pret`, request);
    return response.data;
  }

  async createFiscal(request: CreateDocumentFiscalRequest): Promise<DocumentResponseDTO> {
    const response = await apiClient.post<DocumentResponseDTO>(`${this.basePath}/fiscal`, request);
    return response.data;
  }
}
