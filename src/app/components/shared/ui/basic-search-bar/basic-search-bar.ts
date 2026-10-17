import {Component, input, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-basic-search-bar',
  imports: [
    FormsModule
  ],
  templateUrl: './basic-search-bar.html',
  styleUrl: './basic-search-bar.css',
})
export class BasicSearchBar {
  readonly rechercheChange = output<string>();
  readonly valeur = signal('');
  private debounceTimer?: ReturnType<typeof setTimeout>;
  placeholder= input("Recherche ...");
  onInput(valeur: string) {
    this.valeur.set(valeur);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.rechercheChange.emit(valeur);
    }, 300);
  }
}
