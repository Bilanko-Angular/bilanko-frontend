// product-table-row.ts
import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Produit } from '../../../../models/produit';


type StatutStock = 'ok' | 'warning' | 'error';

@Component({
  selector: 'app-product-table-row',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-table-row.html',
})
export class ProductTableRow {
  readonly produit = input.required<Produit>();
  readonly devise = input<string>('XAF');
  readonly edit = output<Produit>();
  readonly supprimer = output<Produit>();

  statutStock(): StatutStock {
    const p = this.produit();
    if (p.quantiteStock === 0) return 'error';
    if (p.quantiteStock <= p.seuilAlerte) return 'warning';
    return 'ok';
  }

  margeUnitaire(): number {
    const p = this.produit();
    return (p.prixVente || 0) - (p.prixAchat || 0);
  }
}