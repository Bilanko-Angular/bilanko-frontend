import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-capital-financial-needs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './capital-financial-needs.html',
  styleUrl: './capital-financial-needs.css',
})
export class CapitalFinancialNeeds {
  @Input() stockDisponible!: number;
  @Input() dureeHistorique!: number;
  @Input() totalCA!: number;

  @Input() banque!: string;
  @Output() banqueChange = new EventEmitter<string>();

  @Input() agence!: string;
  @Output() agenceChange = new EventEmitter<string>();

  @Input() capitalPropre!: number;
  @Output() capitalPropreChange = new EventEmitter<number>();

  @Input() objetsPret!: readonly {id: string, label: string}[];
  
  @Input() objetPret!: string;
  @Output() objetPretChange = new EventEmitter<string>();

  @Input() montantDemande!: number;
  @Output() montantDemandeChange = new EventEmitter<number>();

  @Input() dureeMois!: number;
  @Output() dureeMoisChange = new EventEmitter<number>();

  @Input() garanties!: string;
  @Output() garantiesChange = new EventEmitter<string>();

  @Input() capaciteRemboursementMensuelle!: number;
  @Input() montantMaxIndicatif!: number;
  @Input() mensualiteEstimee!: number;
  @Input() montantDepasseCapacite!: boolean;
  @Input() caMoyenMensuel!: number;

  normaliserNombre(value: unknown): number {
    const nombre = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(nombre) ? nombre : 0;
  }
}
