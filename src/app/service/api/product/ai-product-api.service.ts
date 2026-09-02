import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { ProductDescriptionClean } from '../../../models/DTO/AiProductDto';

@Injectable({
  providedIn: 'root',
})
export class AiProductApiService {
  private readonly basePath = '/api/ai/products';

  /**
   * Envoie une image au backend et reçoit les informations pré-remplies du produit.
   * @param imageFile Fichier image sélectionné par l'utilisateur
   */
  async recognizeFromImage(imageFile: File): Promise<ProductDescriptionClean> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post<ProductDescriptionClean>(
      `${this.basePath}/recognize`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  /**
   * Envoie un fichier audio au backend et reçoit les informations pré-remplies du produit.
   * @param audioBlob Blob audio enregistré par le micro
   */
  async recognizeFromVoice(audioBlob: Blob): Promise<ProductDescriptionClean> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await apiClient.post<ProductDescriptionClean>(
      `${this.basePath}/recognize-voice`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }
}
