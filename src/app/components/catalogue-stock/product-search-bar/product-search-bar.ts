// product-search-bar.ts
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-search-bar.html',
})
export class ProductSearchBar {
  readonly rechercheChange = output<string>();
  readonly valeur = signal('');
  private debounceTimer?: ReturnType<typeof setTimeout>;

  onInput(valeur: string) {
    this.valeur.set(valeur);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.rechercheChange.emit(valeur);
    }, 300);
  }
}