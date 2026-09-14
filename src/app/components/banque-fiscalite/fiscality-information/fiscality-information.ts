import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegimeFiscal, REGIMES_FISCAUX } from '../../../models/document-fiscal';

@Component({
  selector: 'app-fiscality-information',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './fiscality-information.html',
  styleUrl: './fiscality-information.css',
})
export class FiscalityInformation {
  @Input() regimesFiscaux: {id: string, label: string}[] = [];

  @Input() regimeFiscal!: RegimeFiscal | '';
  @Output() regimeFiscalChange = new EventEmitter<RegimeFiscal | ''>();

  @Input() exerciceFiscal!: string;
  @Output() exerciceFiscalChange = new EventEmitter<string>();

  @Input() centreImpots!: string;
  @Output() centreImpotsChange = new EventEmitter<string>();

  @Input() natureImpot!: string;
  @Output() natureImpotChange = new EventEmitter<string>();

  @Input() periodeDeclaration!: string;
  @Output() periodeDeclarationChange = new EventEmitter<string>();

  @Input() montantImpot!: number;
  @Output() montantImpotChange = new EventEmitter<number>();

  @Input() datePaiement!: string;
  @Output() datePaiementChange = new EventEmitter<string>();

  @Input() moyenPaiement!: string;
  @Output() moyenPaiementChange = new EventEmitter<string>();

  @Input() referencePaiement!: string;
  @Output() referencePaiementChange = new EventEmitter<string>();
}
