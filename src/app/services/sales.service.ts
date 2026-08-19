import { Injectable, signal } from '@angular/core';
import type { Sale } from '../models/finance';

@Injectable({ providedIn: 'root' })
export class SalesService {

  private _sales = signal<Sale[]>([
    // ==============================
    // VENTES DU 10 AOÛT
    // ==============================
    {
      id: '1',
      date: '2026-08-10',
      product: 'Sac de riz 25kg',
      quantity: 4,
      unitPrice: 15000,
      totalAmount: 60000,
      client: 'Restaurant Le Palo'
    },

    {
      id: '2',
      date: '2026-08-10',
      product: 'Caisse de boissons',
      quantity: 8,
      unitPrice: 4000,
      totalAmount: 32000,
      client: 'Client comptant'
    },

    // ==============================
    // VENTES DU 11 AOÛT
    // ==============================
    {
      id: '3',
      date: '2026-08-11',
      product: 'Huile 5L',
      quantity: 6,
      unitPrice: 5500,
      totalAmount: 33000,
      client: 'Boutique La Grâce'
    },

    {
      id: '4',
      date: '2026-08-11',
      product: 'Sucre 1kg',
      quantity: 15,
      unitPrice: 1000,
      totalAmount: 15000,
      client: 'Client comptant'
    },

    {
      id: '5',
      date: '2026-08-11',
      product: 'Savon',
      quantity: 10,
      unitPrice: 1200,
      totalAmount: 12000,
      client: 'Épicerie Centrale'
    },

    // ==============================
    // VENTES DU 12 AOÛT
    // ==============================
    {
      id: '6',
      date: '2026-08-12',
      product: 'Sac de riz 25kg',
      quantity: 5,
      unitPrice: 15000,
      totalAmount: 75000,
      client: 'Restaurant Le Palo'
    },

    {
      id: '7',
      date: '2026-08-12',
      product: 'Caisse de boissons',
      quantity: 10,
      unitPrice: 4000,
      totalAmount: 40000,
      client: 'Client comptant'
    },

    // ==============================
    // VENTES DU 13 AOÛT
    // ==============================
    {
      id: '8',
      date: '2026-08-13',
      product: 'Huile 5L',
      quantity: 8,
      unitPrice: 5500,
      totalAmount: 44000,
      client: 'Boutique La Grâce'
    },

    {
      id: '9',
      date: '2026-08-13',
      product: 'Sucre 1kg',
      quantity: 20,
      unitPrice: 1000,
      totalAmount: 20000,
      client: 'Client comptant'
    },

    {
      id: '10',
      date: '2026-08-13',
      product: 'Lait',
      quantity: 12,
      unitPrice: 1800,
      totalAmount: 21600,
      client: 'Épicerie Centrale'
    },

    {
      id: '11',
      date: '2026-08-13',
      product: 'Savon',
      quantity: 15,
      unitPrice: 1200,
      totalAmount: 18000,
      client: 'Client comptant'
    },

    // ==============================
    // VENTES DU 14 AOÛT
    // ==============================
    {
      id: '12',
      date: '2026-08-14',
      product: 'Sac de riz 25kg',
      quantity: 2,
      unitPrice: 15000,
      totalAmount: 30000,
      client: 'Restaurant Le Palo'
    },

    {
      id: '13',
      date: '2026-08-14',
      product: 'Caisse de boissons',
      quantity: 5,
      unitPrice: 4000,
      totalAmount: 20000,
      client: 'Client comptant'
    },

    {
      id: '14',
      date: '2026-08-14',
      product: 'Huile 5L',
      quantity: 4,
      unitPrice: 5500,
      totalAmount: 22000,
      client: 'Boutique La Grâce'
    },

    // ==============================
    // VENTES DU 15 AOÛT
    // ==============================
    {
      id: '15',
      date: '2026-08-15',
      product: 'Sac de riz 25kg',
      quantity: 6,
      unitPrice: 15000,
      totalAmount: 90000,
      client: 'Restaurant Le Palo'
    },

    {
      id: '16',
      date: '2026-08-15',
      product: 'Sucre 1kg',
      quantity: 25,
      unitPrice: 1000,
      totalAmount: 25000,
      client: 'Client comptant'
    },

    {
      id: '17',
      date: '2026-08-15',
      product: 'Lait',
      quantity: 15,
      unitPrice: 1800,
      totalAmount: 27000,
      client: 'Épicerie Centrale'
    },

    // ==============================
    // VENTES DU 16 AOÛT
    // ==============================
    {
      id: '18',
      date: '2026-08-16',
      product: 'Caisse de boissons',
      quantity: 12,
      unitPrice: 4000,
      totalAmount: 48000,
      client: 'Client comptant'
    },

    {
      id: '19',
      date: '2026-08-16',
      product: 'Huile 5L',
      quantity: 7,
      unitPrice: 5500,
      totalAmount: 38500,
      client: 'Boutique La Grâce'
    },

    {
      id: '20',
      date: '2026-08-16',
      product: 'Savon',
      quantity: 20,
      unitPrice: 1200,
      totalAmount: 24000,
      client: 'Client comptant'
    }
  ]);

  // Signal contenant toutes les ventes
  readonly sales = this._sales;

  // Récupérer les ventes
  load() {
    // Pour le moment les données sont locales.
    // Plus tard, elles viendront de l'API Spring Boot.
    return this._sales();
  }

  // Ajouter une vente
  add(sale: Sale) {
    this._sales.update(curr => [sale, ...curr]);
  }

  // Modifier une vente
  update(id: string, patch: Partial<Sale>) {
    this._sales.update(curr =>
      curr.map(s =>
        s.id === id
          ? { ...s, ...patch }
          : s
      )
    );
  }

  // Supprimer une vente
  delete(id: string) {
    this._sales.update(curr =>
      curr.filter(s => s.id !== id)
    );
  }

  // Filtrer les ventes
  filter(predicate: (s: Sale) => boolean) {
    return this._sales().filter(predicate);
  }
}