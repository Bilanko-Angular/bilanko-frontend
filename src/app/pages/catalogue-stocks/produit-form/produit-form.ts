import { Component, input, output, effect, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Produit } from '../../../models/produit';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produit-form.html',
  styleUrl: './produit-form.css',
})
export class ProduitForm {
  // Entrées/Sorties Signals modernes (Compatible Angular 17.1+)
  readonly produit = input<Produit | undefined>(undefined);
  readonly enregistrer = output<Omit<Produit, 'id'>>();
  readonly annuler = output<void>();

  // Signaux réactifs pour les données du formulaire
  readonly reference = signal('');
  readonly nom = signal('');
  readonly categorie = signal('');
  readonly quantiteStock = signal(0);
  readonly seuilAlerte = signal(5);
  readonly prixAchat = signal(0);

  constructor() {
    effect(() => {
      const p = this.produit();
      if (p) {
        this.reference.set(p.reference);
        this.nom.set(p.nom);
        this.categorie.set(p.categorie);
        this.quantiteStock.set(p.quantiteStock);
        this.seuilAlerte.set(p.seuilAlerte);
        this.prixAchat.set(p.prixAchat);
      } else {
        this.reinitialiser();
      }
    });
  }

  onSubmit(form: NgForm) {
    // Sécurité supplémentaire : le bouton est déjà désactivé si invalide,
    // mais on bloque aussi ici et on affiche les erreurs si jamais le
    // formulaire est soumis (ex: touche Entrée) alors qu'il est incomplet.
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.enregistrer.emit({
      reference: this.reference().trim(),
      nom: this.nom().trim(),
      categorie: this.categorie().trim(),
      quantiteStock: Number(this.quantiteStock()),
      seuilAlerte: Number(this.seuilAlerte()),
      prixAchat: Number(this.prixAchat()),
    });
  }

  fermer() {
    this.annuler.emit();
  }

  private reinitialiser() {
    this.reference.set('');
    this.nom.set('');
    this.categorie.set('');
    this.quantiteStock.set(0);
    this.seuilAlerte.set(5);
    this.prixAchat.set(0);
  }
}