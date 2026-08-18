import { Injectable, signal } from '@angular/core';
import type { Charge } from '../models/finance';

@Injectable({ providedIn: 'root' })
export class ChargesService {
  private _charges = signal<Charge[]>([]);

  readonly charges = this._charges;

  load() {
    return this._charges();
  }

  add(item: Charge) {
    this._charges.update(curr => [item, ...curr]);
  }

  update(id: string, patch: Partial<Charge>) {
    this._charges.update(curr => curr.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  delete(id: string) {
    this._charges.update(curr => curr.filter(c => c.id !== id));
  }
}
