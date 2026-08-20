import { Injectable, signal } from '@angular/core';
import type { Charge } from '../models/finance';

@Injectable({ providedIn: 'root' })
export class ChargesService {

  private _charges = signal<Charge[]>([

    // =========================================
    // CHARGES DU 10 AOÛT
    // =========================================
    {
      id: 'c1',
      date: '2026-08-10',
      label: 'Transport des marchandises',
      category: 'Transport',
      amount: 10000,
      supplier: 'Transport Express',
      paymentMethod: 'Espèces',
      notes: 'Transport des produits'
    },

    {
      id: 'c2',
      date: '2026-08-10',
      label: 'Électricité',
      category: 'Énergie',
      amount: 8000,
      supplier: 'ENEO',
      paymentMethod: 'Mobile Money',
      notes: 'Facture mensuelle'
    },

    // =========================================
    // CHARGES DU 11 AOÛT
    // =========================================
    {
      id: 'c3',
      date: '2026-08-11',
      label: 'Transport',
      category: 'Transport',
      amount: 12000,
      supplier: 'Transport Express',
      paymentMethod: 'Espèces',
      notes: 'Livraison marchandises'
    },

    {
      id: 'c4',
      date: '2026-08-11',
      label: 'Communication',
      category: 'Communication',
      amount: 5000,
      supplier: 'MTN',
      paymentMethod: 'Mobile Money',
      notes: 'Crédit professionnel'
    },

    // =========================================
    // CHARGES DU 12 AOÛT
    // =========================================
    {
      id: 'c5',
      date: '2026-08-12',
      label: 'Emballages',
      category: 'Fournitures',
      amount: 7000,
      supplier: 'Fournitures Douala',
      paymentMethod: 'Espèces',
      notes: 'Sacs et emballages'
    },

    {
      id: 'c6',
      date: '2026-08-12',
      label: 'Nettoyage',
      category: 'Entretien',
      amount: 4000,
      supplier: 'Service Nettoyage',
      paymentMethod: 'Espèces',
      notes: 'Entretien du magasin'
    },

    // =========================================
    // CHARGES DU 13 AOÛT
    // =========================================
    {
      id: 'c7',
      date: '2026-08-13',
      label: 'Transport marchandises',
      category: 'Transport',
      amount: 15000,
      supplier: 'Transport Express',
      paymentMethod: 'Espèces',
      notes: 'Approvisionnement'
    },

    {
      id: 'c8',
      date: '2026-08-13',
      label: 'Eau',
      category: 'Énergie',
      amount: 6000,
      supplier: 'CDE',
      paymentMethod: 'Mobile Money',
      notes: 'Facture eau'
    },

    {
      id: 'c9',
      date: '2026-08-13',
      label: 'Communication',
      category: 'Communication',
      amount: 4000,
      supplier: 'Orange',
      paymentMethod: 'Mobile Money',
      notes: 'Communication professionnelle'
    },

    // =========================================
    // CHARGES DU 14 AOÛT
    // =========================================
    {
      id: 'c10',
      date: '2026-08-14',
      label: 'Transport',
      category: 'Transport',
      amount: 10000,
      supplier: 'Transport Express',
      paymentMethod: 'Espèces',
      notes: 'Livraison'
    },

    {
      id: 'c11',
      date: '2026-08-14',
      label: 'Entretien du magasin',
      category: 'Entretien',
      amount: 5000,
      supplier: 'Service Nettoyage',
      paymentMethod: 'Espèces',
      notes: 'Nettoyage'
    },

    // =========================================
    // CHARGES DU 15 AOÛT
    // =========================================
    {
      id: 'c12',
      date: '2026-08-15',
      label: 'Transport marchandises',
      category: 'Transport',
      amount: 18000,
      supplier: 'Transport Express',
      paymentMethod: 'Espèces',
      notes: 'Approvisionnement important'
    },

    {
      id: 'c13',
      date: '2026-08-15',
      label: 'Électricité',
      category: 'Énergie',
      amount: 7000,
      supplier: 'ENEO',
      paymentMethod: 'Mobile Money',
      notes: 'Consommation électrique'
    },

    {
      id: 'c14',
      date: '2026-08-15',
      label: 'Emballages',
      category: 'Fournitures',
      amount: 6000,
      supplier: 'Fournitures Douala',
      paymentMethod: 'Espèces',
      notes: 'Sacs et emballages'
    },

    // =========================================
    // CHARGES DU 16 AOÛT
    // =========================================
    {
      id: 'c15',
      date: '2026-08-16',
      label: 'Transport',
      category: 'Transport',
      amount: 12000,
      supplier: 'Transport Express',
      paymentMethod: 'Espèces',
      notes: 'Livraison produits'
    },

    {
      id: 'c16',
      date: '2026-08-16',
      label: 'Communication',
      category: 'Communication',
      amount: 5000,
      supplier: 'MTN',
      paymentMethod: 'Mobile Money',
      notes: 'Communication professionnelle'
    },

    {
      id: 'c17',
      date: '2026-08-16',
      label: 'Entretien',
      category: 'Entretien',
      amount: 4000,
      supplier: 'Service Nettoyage',
      paymentMethod: 'Espèces',
      notes: 'Nettoyage du magasin'
    }
  ]);

  // Toutes les charges
  readonly charges = this._charges;

  // Récupérer les charges
  load() {
    return this._charges();
  }

  // Ajouter une charge
  add(item: Charge) {
    this._charges.update(curr => [item, ...curr]);
  }

  // Modifier une charge
  update(id: string, patch: Partial<Charge>) {
    this._charges.update(curr =>
      curr.map(c =>
        c.id === id
          ? { ...c, ...patch }
          : c
      )
    );
  }

  // Supprimer une charge
  delete(id: string) {
    this._charges.update(curr =>
      curr.filter(c => c.id !== id)
    );
  }
}