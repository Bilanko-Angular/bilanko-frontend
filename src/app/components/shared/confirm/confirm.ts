import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
