import { Injectable, signal } from '@angular/core';
import type { Sale } from '../models/finance';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private _sales = signal<Sale[]>([
    { id: '1', date: '2026-08-14', product: 'Sac de riz 25kg', quantity: 2, unitPrice: 15000, totalAmount: 30000, client: 'Restaurant Le Palo' },
    { id: '2', date: '2026-08-14', product: 'Caisse de boissons', quantity: 5, unitPrice: 4000, totalAmount: 20000, client: 'Client comptant' }
  ]);

  readonly sales = this._sales;

  load() {
    // placeholder for future backend call
    return this._sales();
  }

  add(sale: Sale) {
    this._sales.update(curr => [sale, ...curr]);
  }

  update(id: string, patch: Partial<Sale>) {
    this._sales.update(curr => curr.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  delete(id: string) {
    this._sales.update(curr => curr.filter(s => s.id !== id));
  }

  filter(predicate: (s: Sale) => boolean) {
    return this._sales().filter(predicate);
  }
}
