// src/app/services/produit.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Produit } from '../models/produit';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly http = inject(HttpClient);
  //Lien à modifier lors de l'intégration du backend
  private readonly url = `/api/produits.json`;

  // LECTURE — httpResource expose isLoading() / error() / value()
  readonly catalogue = httpResource<Produit[]>(() => this.url);

  // ÉCRITURES — HttpClient direct (httpResource ne sert qu'à lire)
  ajouter(produit: Omit<Produit, 'id'>) {
    return this.http.post<Produit>(this.url, produit);
  }

  modifier(id: string, modifs: Partial<Produit>) {
    return this.http.put<Produit>(`${this.url}/${id}`, modifs);
  }

  supprimer(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}