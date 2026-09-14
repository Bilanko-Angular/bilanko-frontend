import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TypeDossier } from '../../../models/document-fiscal';

@Component({
  selector: 'app-select-type-document',
  standalone: true,
  imports: [],
  templateUrl: './select-type-document.html',
  styleUrl: './select-type-document.css',
})
export class SelectTypeDocument {
  @Input() typeDossier!: TypeDossier | null;
  @Output() typeDossierChange = new EventEmitter<TypeDossier>();
  @Output() etapeSuivante = new EventEmitter<void>();

  choisirType(t: TypeDossier) {
    this.typeDossierChange.emit(t);
  }

  continuer() {
    this.etapeSuivante.emit();
  }
}
