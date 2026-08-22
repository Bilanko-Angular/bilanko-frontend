import { Injectable } from '@angular/core';
import { Produit } from '../../../models/produit';
import { ProductApiDto } from '../../../models/DTO/ProductDto';
import { ProductMapper } from '../../../mapper/ProductMapper';
import { CreateProduitPayload, UpdateProduitPayload } from '../../../models/DTO/payload/ProductPayload';
import { apiClient } from '../../../core/axios/axios.config';


@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly basePath = '/api/products';

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
}