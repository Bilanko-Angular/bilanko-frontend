import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LigneHistorique } from '../../../models/document-fiscal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-revenue-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue-activity.html',
  styleUrl: './revenue-activity.css',
})
export class RevenueActivity {
  @Input() dureeHistorique!: 6 | 12;
  @Output() dureeHistoriqueChange = new EventEmitter<6 | 12>();

  @Input() historique!: LigneHistorique[];
  @Input() maxCA!: number;
  @Input() totalCA!: number;
  @Input() caMoyenMensuel!: number;
  @Input() margeBrute!: number;
  @Input() moisSansVente!: number;
  @Input() peutContinuerEtape3!: boolean;

  @Output() etapePrecedente = new EventEmitter<void>();
  @Output() etapeSuivante = new EventEmitter<void>();

  changerDureeHistorique(duree: 6 | 12) {
    this.dureeHistoriqueChange.emit(duree);
  }
}
