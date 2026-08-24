// product-delete-modal.ts
import { Component, input, output } from '@angular/core';
import { Produit } from '../../../models/produit';

@Component({
  selector: 'app-product-delete-modal',
  standalone: true,
  templateUrl: './product-delete-modal.html',
})
export class ProductDeleteModal {
  readonly produit = input<Produit | undefined>(undefined);
  readonly confirmer = output<void>();
  readonly annuler = output<void>();
}