// product-filter-dropdown.ts
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CategorieOption {
  id: number;
  name: string;
}

export interface FiltresProduit {
  categorieId?: number;
  statut: 'tous' | 'ok' | 'warning' | 'error';
}

@Component({
  selector: 'app-product-filter-dropdown',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-filter-dropdown.html',
})
export class ProductFilterDropdown {
  readonly categories = input<CategorieOption[]>([]);
  readonly filtresChange = output<FiltresProduit>();

  readonly ouvert = signal(false);
  readonly categorieId = signal<number | undefined>(undefined);
  readonly statut = signal<'tous' | 'ok' | 'warning' | 'error'>('tous');

  toggle() {
    this.ouvert.update((v) => !v);
  }

  appliquer() {
    this.filtresChange.emit({ categorieId: this.categorieId(), statut: this.statut() });
    this.ouvert.set(false);
  }

  reinitialiser() {
    this.categorieId.set(undefined);
    this.statut.set('tous');
    this.filtresChange.emit({ categorieId: undefined, statut: 'tous' });
  }
}