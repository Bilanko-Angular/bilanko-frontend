import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produit } from '../models/produit';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // Détection automatique : Si une URL API existe dans environment, on l'utilise
  private readonly apiUrl = environment.baseApiUrl ? `${environment.baseApiUrl}/produits` : '';

  // Données locales initiales (utilisées seulement s'il n'y a pas de backend)
  private readonly donneesLocales = signal<Produit[]>([
    {
      id: '1',
      reference: 'REF-001',
      nom: 'MacBook Pro 16" M3 Max',
      categorie: 'Informatique',
      quantiteStock: 45,
      seuilAlerte: 10,
      prixAchat: 2200000,
    },
    {
      id: '2',
      reference: 'REF-045',
      nom: 'Onduleur APC Smart-UPS',
      categorie: 'Énergie',
      quantiteStock: 4,
      seuilAlerte: 5,
      prixAchat: 450000,
    },
  ]);

  // Expose un objet compatible pour le composant (catalogue.value())
  readonly catalogue = {
    value: this.donneesLocales.asReadonly(),
    isLoading: signal(false).asReadonly(),
    error: signal(null).asReadonly(),
  };

  constructor() {
    // Si une URL backend est configurée et qu'on est côté navigateur, charger les données
    if (this.apiUrl && isPlatformBrowser(this.platformId)) {
      this.chargerDepuisBackend();
    }
  }

  private chargerDepuisBackend() {
    this.http.get<Produit[]>(this.apiUrl).subscribe({
      next: (data) => this.donneesLocales.set(data),
      error: (err) => console.error('Erreur chargement backend:', err),
    });
  }

  ajouter(produit: Omit<Produit, 'id'>): Observable<Produit> {
    if (this.apiUrl) {
      // Requête Backend réelle
      return this.http.post<Produit>(this.apiUrl, produit).pipe(
        tap((nouveauProduit) => {
          this.donneesLocales.update((liste) => [...liste, nouveauProduit]);
        })
      );
    } else {
      // Mode Sans Backend
      const nouveauProduit: Produit = { ...produit, id: Date.now().toString() };
      this.donneesLocales.update((liste) => [...liste, nouveauProduit]);
      return of(nouveauProduit);
    }
  }

  modifier(id: string, modifs: Partial<Produit>): Observable<Produit> {
    if (this.apiUrl) {
      // Requête Backend réelle
      return this.http.put<Produit>(`${this.apiUrl}/${id}`, modifs).pipe(
        tap((produitMaj) => {
          this.donneesLocales.update((liste) =>
            liste.map((p) => (p.id === id ? produitMaj : p))
          );
        })
      );
    } else {
      // Mode Sans Backend
      let produitMaj!: Produit;
      this.donneesLocales.update((liste) =>
        liste.map((p) => {
          if (p.id === id) {
            produitMaj = { ...p, ...modifs };
            return produitMaj;
          }
          return p;
        })
      );
      return of(produitMaj);
    }
  }

  supprimer(id: string): Observable<void> {
    if (this.apiUrl) {
      // Requête Backend réelle
      return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        tap(() => {
          this.donneesLocales.update((liste) => liste.filter((p) => p.id !== id));
        })
      );
    } else {
      // Mode Sans Backend
      this.donneesLocales.update((liste) => liste.filter((p) => p.id !== id));
      return of(undefined);
    }
  }
}