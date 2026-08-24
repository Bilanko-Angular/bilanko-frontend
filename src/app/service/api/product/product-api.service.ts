import { Injectable } from '@angular/core';
import { Produit } from '../../../models/produit';
import { PagedProduits, ProductApiDto, SearchProduitParams } from '../../../models/DTO/ProductDto';
import { ProductMapper } from '../../../mapper/ProductMapper';
import { CreateProduitPayload, UpdateProduitPayload } from '../../../models/DTO/payload/ProductPayload';
import { apiClient } from '../../../core/axios/axios.config';
import { PagedResponseDto } from '../../../models/DTO/response/PageResponse';


@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly basePath = '/products';

  async getAll(): Promise<Produit[]> {
    const response = await apiClient.get<ProductApiDto[]>(`${this.basePath}/all`);
    return ProductMapper.toProduitList(response.data);
  }

  async getMine(): Promise<Produit[]> {
    const response = await apiClient.get<ProductApiDto[]>(`${this.basePath}/my`);
    return ProductMapper.toProduitList(response.data);
  }

  async getById(id: string): Promise<Produit> {
    const response = await apiClient.get<ProductApiDto>(`${this.basePath}/${id}`);
    return ProductMapper.toProduit(response.data);
  }

  async create(payload: CreateProduitPayload): Promise<Produit> {
    const body = ProductMapper.toCreateApiDto(payload);
    const response = await apiClient.post<ProductApiDto>(`${this.basePath}/create`, body);
    return ProductMapper.toProduit(response.data);
  }

  async update(id: string, payload: UpdateProduitPayload): Promise<Produit> {
    const body = ProductMapper.toUpdateApiDto(payload);
    const response = await apiClient.put<ProductApiDto>(`${this.basePath}/${id}`, body);
    return ProductMapper.toProduit(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async search(params: SearchProduitParams): Promise<PagedProduits> {
    const response = await apiClient.get<PagedResponseDto<ProductApiDto>>(`${this.basePath}/search`, {
      params: {
        search: params.search || undefined,
        categoryId: params.categoryId || undefined,
        stockStatus: params.stockStatus && params.stockStatus !== 'tous' ? params.stockStatus : undefined,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return {
      produits: ProductMapper.toProduitList(response.data.content),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.number,
    };
  }
}