import { Injectable } from '@angular/core';
import { CategorieOption } from '../../../components/catalogue-stock/product-filter-dropdown/product-filter-dropdown';
import { CategoryApiDto } from '../../../models/DTO/CategoryDto';
import { apiClient } from '../../../core/axios/axios.config';

@Injectable({
  providedIn: 'root',
})
export class CategoryApiService {
  private readonly basePath = '/categories';

  async getAll(): Promise<CategorieOption[]> {
    const response = await apiClient.get<CategoryApiDto[]>(this.basePath + '/all');
    return response.data.map((dto) => ({ id: dto.id, name: dto.name }));
  }

  async search(name: string): Promise<CategorieOption[]> {
    const response = await apiClient.get<CategoryApiDto[]>(this.basePath + '/search', {
      params: { name },
    });
    return response.data.map((dto) => ({ id: dto.id, name: dto.name }));
  }

  async create(name: string): Promise<CategorieOption> {
    const response = await apiClient.post<CategoryApiDto>(this.basePath, { name });
    return { id: response.data.id, name: response.data.name };
  }
}