import { Injectable, signal } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { environment } from '../../../../environments/environment';
import type { GlobalSearchResultDTO } from '../../../models/DTO/GlobalSearchDto';

@Injectable({
  providedIn: 'root',
})
export class GlobalSearchApiService {
  private readonly endpoint = `${environment.baseApiUrl}/search/global`;
  readonly results = signal<GlobalSearchResultDTO[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  private debounceTimer?: ReturnType<typeof setTimeout>;

  async search(keyword: string): Promise<GlobalSearchResultDTO[]> {
    const response = await apiClient.get<GlobalSearchResultDTO[]>(this.endpoint, {
      params: { keyword },
    });
    return response.data;
  }

  async searchWithPost(keyword: string): Promise<GlobalSearchResultDTO[]> {
    const response = await apiClient.post<GlobalSearchResultDTO[]>(this.endpoint, { keyword });
    return response.data;
  }

  searchDebounced(keyword: string): void {
    clearTimeout(this.debounceTimer);
    const normalized = keyword.trim();
    if (!normalized) {
      this.results.set([]);
      this.error.set(null);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.debounceTimer = setTimeout(() => {
      void this.executeSearch(normalized);
    }, 300);
  }

  clear(): void {
    clearTimeout(this.debounceTimer);
    this.results.set([]);
    this.error.set(null);
    this.isLoading.set(false);
  }

  private async executeSearch(keyword: string): Promise<void> {
    try {
      this.results.set(await this.search(keyword));
    } catch (err) {
      console.error('GlobalSearch: erreur lors de la recherche', err);
      this.results.set([]);
      this.error.set('Impossible de charger les résultats de recherche.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
