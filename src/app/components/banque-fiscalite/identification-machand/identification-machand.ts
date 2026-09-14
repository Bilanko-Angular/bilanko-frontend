import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-identification-machand',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './identification-machand.html',
  styleUrl: './identification-machand.css',
})
export class IdentificationMachand {
  @Input() raisonSociale!: string;
  @Output() raisonSocialeChange = new EventEmitter<string>();

  @Input() activite!: string;
  @Output() activiteChange = new EventEmitter<string>();

  @Input() adresse!: string;
  @Output() adresseChange = new EventEmitter<string>();

  @Input() niu!: string;
  @Output() niuChange = new EventEmitter<string>();

  @Input() dateCreation!: string;
  @Output() dateCreationChange = new EventEmitter<string>();
}
