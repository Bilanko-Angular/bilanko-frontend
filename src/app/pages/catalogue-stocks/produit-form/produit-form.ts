
import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../../models/produit';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produit-form.html',
  styleUrl: './produit-form.css',
})
export class ProduitForm {
  // INPUT optionnel : si fourni => mode édition, sinon => mode création
  produitInitial = input<Produit>();

  // OUTPUTS : l'enfant ne connaît pas son parent, il émet, c'est tout
  enregistrer = output<Omit<Produit, 'id'>>();
  annuler = output<void>();

  // État local du formulaire, pré-rempli si édition
  reference = signal('');
  nom = signal('');
  categorie = signal('');
  prixAchat = signal(0);
  prixVente = signal(0);
  quantiteStock = signal(0);
  seuilAlerte = signal(5);

  constructor() {
    // effect() synchronise le formulaire dès que l'input change
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