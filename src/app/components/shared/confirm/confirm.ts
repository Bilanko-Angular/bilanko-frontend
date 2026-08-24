import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
 
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-confirm',
  standalone: true,
  templateUrl: './confirm.html',
  styleUrls: ['./confirm.css']
})
export class ConfirmDialog {
  @Input() message = 'Êtes-vous sûr ?';
  @Input() confirmLabel = 'Supprimer';
  @Input() cancelLabel = 'Annuler';
  @Output() confirm = new EventEmitter<void>();
  
  @Output() cancel = new EventEmitter<void>();
  protected readonly prefs = inject(PreferencesService);

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
