import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Template } from "../../components/shared/template/template";
import type { Charge, Sale } from '../../models/finance';
import { FinanceForm } from '../../components/shared/finance-form/finance-form';
import { ChargesService } from '../../services/charges.service';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { ConfirmDialog } from '../../components/shared/confirm/confirm';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, Template, ActionMenu, ConfirmDialog, FinanceForm],
  templateUrl: './charges.html',
  styleUrls: ['./charges.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargesComponent {
  private chargesService = inject(ChargesService);

  charges = this.chargesService.charges;
  editingCharge: Charge | null = null;
  isAddModalOpen = signal(false);
  isFilterModalOpen = signal(false);
  confirmDeleteId = signal<string | null>(null);

  openAdd() {
    this.editingCharge = null;
    this.isAddModalOpen.set(true);
  }

  closeAdd() {
    this.isAddModalOpen.set(false);
    this.editingCharge = null;
  }

  // Le formulaire partagé (FinanceForm) émet Sale | Charge selon le contexte.
  // Ici [kind]="'charge'" donc on sait que c'est toujours une Charge.
  handleChargeSubmit(payload: Sale | Charge) {
    const c = payload as Charge;
    if (this.editingCharge) {
      this.chargesService.update(this.editingCharge.id, c);
    } else {
      this.chargesService.add(c);
    }
    this.closeAdd();
  }

  showDeleteConfirm(id: string) {
    this.confirmDeleteId.set(id);
  }

  confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) this.chargesService.delete(id);
    this.confirmDeleteId.set(null);
  }

  cancelDelete() {
    this.confirmDeleteId.set(null);
  }

  onChargeAction(actionType: string, id: string) {
    if (actionType === 'delete') {
      this.showDeleteConfirm(id);
    }
    if (actionType === 'edit') {
      const c = this.chargesService.charges().find((x) => x.id === id) || null;
      if (c) {
        this.editingCharge = c;
        this.isAddModalOpen.set(true);
      }
    }
  }
}