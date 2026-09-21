import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TypeDossier } from '../../../models/document-fiscal';
import { InfoCleDTO } from '../../../models/DTO/DocumentDto';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  @Input() raisonSociale!: string;
  @Input() activite!: string;
  @Input() adresse!: string;
  @Input() niu!: string;
  @Input() typeDossier!: TypeDossier | null;
  @Input() montantDemande!: number;
  @Input() banque!: string;
  @Input() agence!: string;
  /** Libellé affiché (nom), pas le slug */
  @Input() objetPret!: string;
  @Input() dureeMois!: number;

  @Input() montantImpot!: number;
  /** Libellés affichés (nom), pas les slugs */
  @Input() natureImpot!: string;
  @Input() periodeDeclaration!: string;
  @Input() centreImpots!: string;
  @Input() referencePaiement!: string;

  @Input() totalCA!: number;
  @Input() dureeHistorique!: number;
  @Input() margeBrute!: number;
  @Input() piecesAJoindre!: readonly InfoCleDTO[];

  @Input() erreurGeneration!: string | null;
  @Input() genereEnCours!: boolean;
  @Input() peutGenerer!: boolean;

  @Output() etapePrecedente = new EventEmitter<void>();
  @Output() genererDossier = new EventEmitter<void>();
}
