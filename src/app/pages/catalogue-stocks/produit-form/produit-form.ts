import { Component, input, output, signal, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../../models/produit';
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produit-form.html',
  styleUrl: './produit-form.css',
})
export class ProduitForm {
  protected readonly prefs = inject(PreferencesService);
  produitInitial = input<Produit>();
  enregistrer = output<Omit<Produit, 'id'>>();
  annuler = output<void>();

  reference = signal('');
  nom = signal('');
  categorie = signal('');
  prixAchat = signal(0);
  prixVente = signal(0);
  quantiteStock = signal(0);
  seuilAlerte = signal(5);

  constructor() {
    effect(() => {
      const p = this.produitInitial();
      if (p) {
        this.reference.set(p.reference);
        this.nom.set(p.nom);
        this.categorie.set(p.categorie);
        this.prixAchat.set(p.prixAchat);
        this.prixVente.set(p.prixVente);
        this.quantiteStock.set(p.quantiteStock);
        this.seuilAlerte.set(p.seuilAlerte);
      }
    });
  }

  onSubmit() {
    this.enregistrer.emit({
      reference: this.reference(),
      nom: this.nom(),
      categorie: this.categorie(),
      prixAchat: this.prixAchat(),
      prixVente: this.prixVente(),
      quantiteStock: this.quantiteStock(),
      seuilAlerte: this.seuilAlerte(),
    });
  }
}