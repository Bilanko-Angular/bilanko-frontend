// product-table.ts
import { Component, input, output } from '@angular/core';
import { Produit } from '../../../models/produit';
import { ProductTableRow } from './product-table-row/product-table-row';
import { ProductSkeletonRow } from './product-skeleton-row/product-skeleton-row';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [ProductTableRow, ProductSkeletonRow],
  templateUrl: './product-table.html',
})
export class ProductTable {
  readonly produits = input.required<Produit[]>();
  readonly isLoading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly devise = input<string>('XAF');

  readonly edit = output<Produit>();
  readonly supprimer = output<Produit>();
}