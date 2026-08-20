// src/app/services/produit.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Produit } from '../models/produit';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // Adaptez ce chemin selon le nom réel de votre fichier dans public/ (ex: '/plat.json')
  private readonly url = '/api/produits.json';

  // LECTURE — httpResource ignore la requête lors du SSR/Prerender sur Vercel
  readonly catalogue = httpResource<Produit[]>(
    () => (isPlatformBrowser(this.platformId) ? this.url : undefined),
    { defaultValue: [] }
  );

  // ÉCRITURES — Exécutées uniquement sur le client lors des interactions utilisateur
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