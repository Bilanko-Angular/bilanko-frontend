import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TypeDossier } from '../../../models/document-fiscal';

@Component({
  selector: 'app-aside-bank-fiscality',
  standalone: true,
  imports: [],
  templateUrl: './aside-bank-fiscality.html',
  styleUrl: './aside-bank-fiscality.css',
})
export class AsideBankFiscality {
  @Input() typeDossier!: TypeDossier | null;
  @Input() montantDemande!: number;
  @Input() stockDisponible!: number;
  @Input() dureeHistorique!: number;
  @Input() totalCA!: number;
  @Input() margeBrute!: number;
}
