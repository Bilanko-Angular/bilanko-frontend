// src/app/pages/ventes/ventes.ts
import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import type { Sale, Charge } from '../../models/finance';
import { Template } from "../../components/shared/template/template";
import { ConfirmDialog } from '../../components/shared/confirm/confirm';
import { ActionMenu } from '../../components/shared/action-menu/action-menu';
import { FinanceForm } from '../../components/shared/finance-form/finance-form';
import { SalesService } from '../../services/sales.service';
import { PreferencesService } from '../../services/preferences';

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, Template, ConfirmDialog, ActionMenu, FinanceForm, CurrencyPipe],
  templateUrl: './ventes.html',
  styleUrls: ['./ventes.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesComponent {
  private fb = inject(FormBuilder);
  private salesService = inject(SalesService);
  protected readonly prefs = inject(PreferencesService);

  isFilterModalOpen = signal(false);
  isAddModalOpen = signal(false);
  openMenuId = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);
  availableStock = 50;
  sales = this.salesService.sales;
  editingSale: Sale | null = null;

  saleForm: FormGroup = this.fb.group({
    product: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    client: ['']
  });

  openAddModal() { this.isAddModalOpen.set(true); this.openMenuId.set(null); }
  closeAddModal() { this.isAddModalOpen.set(false); this.saleForm.reset({ quantity: 1 }); }
  openFilterModal() { this.isFilterModalOpen.set(true); }
  closeFilterModal() { this.isFilterModalOpen.set(false); }
  toggleActionMenu(saleId: string) { this.openMenuId.update(c => c === saleId ? null : saleId); }

  editSale(saleId: string) {
    const s = this.salesService.sales().find(x => x.id === saleId) || null;
    if (s) {
      this.editingSale = s;
      this.isAddModalOpen.set(true);
    }
    this.openMenuId.set(null);
  }

  onRowAction(actionType: string, saleId: string) {
    if (actionType === 'edit') this.editSale(saleId);
    if (actionType === 'delete') this.showDeleteConfirm(saleId);
  }

  showDeleteConfirm(saleId: string) {
    this.confirmDeleteId.set(saleId);
    this.openMenuId.set(null);
  }

  confirmDelete() {
    const id = this.confirmDeleteId();
    if (id) this.salesService.delete(id);
    this.confirmDeleteId.set(null);
  }

  cancelDelete() { this.confirmDeleteId.set(null); }

  onSubmit() {
    if (this.saleForm.invalid) { this.saleForm.markAllAsTouched(); return; }
    const formValue = this.saleForm.value;
    if (formValue.quantity > this.availableStock) {
      this.saleForm.get('quantity')?.setErrors({ stockError: true });
      return;
    }
    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      product: formValue.product,
      quantity: formValue.quantity,
      unitPrice: 15000,
      totalAmount: formValue.quantity * 15000,
      client: formValue.client || 'Client comptant'
    };
    this.salesService.add(newSale);
    this.closeAddModal();
  }

  handleSaleSubmit(payload: Sale | Charge) {
    const sale = payload as Sale;
    if (this.editingSale) {
      this.salesService.update(this.editingSale.id, sale);
      this.editingSale = null;
    } else {
      this.salesService.add(sale);
    }
    this.closeAddModal();
  }
}