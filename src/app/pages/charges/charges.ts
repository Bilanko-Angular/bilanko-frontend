import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Template } from "../../components/shared/template/template";
import type { Charge } from '../../models/finance';
import { FinanceForm } from '../../components/shared/finance-form/finance-form';
import { ChargesService } from '../../services/charges.service';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { ConfirmDialog } from '../../components/shared/confirm/confirm';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Template, ActionMenu, ConfirmDialog, FinanceForm],
  templateUrl: './charges.html',
  styleUrls: ['./charges.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class ChargesComponent {
  private fb = inject(FormBuilder);
  private chargesService = inject(ChargesService);

  charges = this.chargesService.charges;
  editingCharge: Charge | null = null;
  isAddModalOpen = signal(false);
  isFilterModalOpen = signal(false);
  openMenuId = signal<string | null>(null);

  chargeForm: FormGroup = this.fb.group({
    label: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    supplier: ['']
  });

  openAdd() { this.isAddModalOpen.set(true); }
  closeAdd() { this.isAddModalOpen.set(false); this.chargeForm.reset({ amount: 0 }); }

  addCharge() {
    if (this.chargeForm.invalid) { this.chargeForm.markAllAsTouched(); return; }
    const v = this.chargeForm.value;
    const newCharge: Charge = {
      id: Date.now().toString(),
      date: v.date,
      label: v.label,
      amount: v.amount,
      supplier: v.supplier
    };
    this.chargesService.add(newCharge);
    this.closeAdd();
  }

  // Public handler for shared finance form submissions
  handleChargeSubmit(payload: Charge | any) {
    const c = payload as Charge;
    if (this.editingCharge) {
      this.chargesService.update(this.editingCharge.id, c);
      this.editingCharge = null;
    } else {
      this.chargesService.add(c);
    }
    this.closeAdd();
  }

  toggleActionMenu(id: string) { this.openMenuId.update(curr => curr === id ? null : id); }
  confirmDeleteId = signal<string | null>(null);

  showDeleteConfirm(id: string) { this.confirmDeleteId.set(id); this.openMenuId.set(null); }
  confirmDelete() { const id = this.confirmDeleteId(); if (id) this.chargesService.delete(id); this.confirmDeleteId.set(null); }
  cancelDelete() { this.confirmDeleteId.set(null); }

  onChargeAction(actionType: string, id: string) {
    if (actionType === 'delete') this.showDeleteConfirm(id);
    if (actionType === 'edit') {
      const c = this.chargesService.charges().find(x => x.id === id) || null;
      if (c) {
        this.editingCharge = c;
        this.isAddModalOpen.set(true);
      }
    }
  }
}
