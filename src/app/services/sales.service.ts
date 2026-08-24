import { Injectable, signal } from '@angular/core';
import type { Sale, SaleItem } from '../models/sale';

@Injectable({ providedIn: 'root' })
export class SalesService {

  private _sales = signal<Sale[]>([
    {
      id: '1',
      saleDate: '2026-08-10T09:00:00',
      customerName: 'Restaurant Le Palo',
      totalAmount: 60000,
      totalMargin: 12000,
      items: [
        { id: '101', productId: 'p1', productName: 'Sac de riz 25kg', quantity: 4, unitSellingPrice: 15000, unitPurchasePrice: 12000, margin: 12000 }
      ]
    },
    {
      id: '2',
      saleDate: '2026-08-10T14:20:00',
      customerName: 'Client comptant',
      totalAmount: 32000,
      totalMargin: 8000,
      items: [
        { id: '102', productId: 'p2', productName: 'Caisse de boissons', quantity: 8, unitSellingPrice: 4000, unitPurchasePrice: 3000, margin: 8000 }
      ]
    },
    {
      id: '3',
      saleDate: '2026-08-11T10:15:00',
      customerName: 'Boutique La Grâce',
      totalAmount: 48000,
      totalMargin: 15000,
      items: [
        { id: '103', productId: 'p3', productName: 'Huile 5L', quantity: 6, unitSellingPrice: 5500, unitPurchasePrice: 3500, margin: 12000 },
        { id: '104', productId: 'p4', productName: 'Sucre 1kg', quantity: 15, unitSellingPrice: 1000, unitPurchasePrice: 800, margin: 3000 }
      ]
    },
    {
      id: '4',
      saleDate: '2026-08-11T16:40:00',
      customerName: 'Épicerie Centrale',
      totalAmount: 12000,
      totalMargin: 3000,
      items: [
        { id: '105', productId: 'p5', productName: 'Savon', quantity: 10, unitSellingPrice: 1200, unitPurchasePrice: 900, margin: 3000 }
      ]
    },
  ]);

  readonly sales = this._sales;

  load() {
    return this._sales();
  }

  getById(id: string): Sale | undefined {
    return this._sales().find(s => s.id === id);
  }

  add(sale: Omit<Sale, 'id'>) {
    const newSale: Sale = { ...sale, id: Date.now().toString() };
    this._sales.update(curr => [newSale, ...curr]);
  }

  update(id: string, patch: Partial<Sale>) {
    this._sales.update(curr => curr.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  delete(id: string) {
    this._sales.update(curr => curr.filter(s => s.id !== id));
  }
}