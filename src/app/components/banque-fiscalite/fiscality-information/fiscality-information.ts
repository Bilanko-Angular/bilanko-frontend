import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoCleDTO } from '../../../models/DTO/DocumentDto';

@Component({
  selector: 'app-fiscality-information',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './fiscality-information.html',
  styleUrl: './fiscality-information.css',
})
export class FiscalityInformation {
  /** Catalogues backend : `nom` affiché, `slug` sélectionné / envoyé */
  @Input() regimesFiscaux: readonly InfoCleDTO[] = [];
  @Input() centresImpots: readonly InfoCleDTO[] = [];
  @Input() naturesImpot: readonly InfoCleDTO[] = [];

  /** Slug du régime fiscal sélectionné */
  @Input() regimeFiscal!: string;
  @Output() regimeFiscalChange = new EventEmitter<string>();

  @Input() exerciceFiscal!: string;
  @Output() exerciceFiscalChange = new EventEmitter<string>();

  /** Slug du centre des impôts */
  @Input() centreImpots!: string;
  @Output() centreImpotsChange = new EventEmitter<string>();

  /** Slug de la nature d'impôt */
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
