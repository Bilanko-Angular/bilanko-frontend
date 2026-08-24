// src/app/components/shared/finance-form/finance-form.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import type { Charge } from '../../../models/finance';
import type { Sale } from '../../../models/sale';
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-finance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-form.html',
  styleUrls: ['./finance-form.css']
})
export class FinanceForm {
  @Input() kind: 'sale' | 'charge' = 'sale';
  @Input() initial: Sale | Charge | null = null;
  @Output() submit = new EventEmitter<Sale | Charge>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  protected readonly prefs = inject(PreferencesService);

  form = this.fb.group({
    // Sale fields
    product: [''],
    quantity: [1, [Validators.min(1)]],
    unitPrice: [0, [Validators.min(0)]],
    client: [''],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    // Charge fields
    label: [''],
    amount: [0, [Validators.min(0)]],
    supplier: [''],
    notes: ['']
  });

  ngOnChanges() {
    if (!this.initial) return;
    // Vérifier si c'est une vente (possède 'product')
    if ('product' in this.initial) {
      const s = this.initial as Sale;
      this.form.patchValue({ 
        product: s.product || s.items?.[0]?.productName || '', 
        quantity: s.quantity || s.items?.[0]?.quantity || 1, 
        unitPrice: s.unitPrice || s.items?.[0]?.unitSellingPrice || 0, 
        client: s.client || s.customerName || '', 
        date: s.date || s.saleDate?.split('T')[0] || new Date().toISOString().split('T')[0]
      });
    } else {
      const c = this.initial as Charge;
      this.form.patchValue({ 
        label: c.label, 
        amount: c.amount, 
        supplier: c.supplier, 
        date: c.date 
      });
    }
  }

  isSale() { return this.kind === 'sale'; }

  onCancel() { this.cancel.emit(); }

  onSubmit() {
    if (this.isSale()) {
      const product = this.form.get('product')?.value;
      const quantity = Number(this.form.get('quantity')?.value || 0);
      const unitPrice = Number(this.form.get('unitPrice')?.value || 0);
      if (!product || quantity < 1) {
        this.form.get('product')?.markAsTouched();
        this.form.get('quantity')?.markAsTouched();
        return;
      }

      // NOUVELLE STRUCTURE : Créer un sale avec le bon format
      const sale: Sale = {
        id: (this.initial as Sale | null)?.id || Date.now().toString(),
        saleDate: new Date(this.form.get('date')?.value ?? new Date()).toISOString(),
        customerName: this.form.get('client')?.value?.trim() || 'Client comptant',
        totalAmount: quantity * unitPrice,
        totalMargin: 0, // On peut calculer plus tard
        items: [{
          productId: `temp-${Date.now()}`,
          productName: product,
          quantity: quantity,
          unitSellingPrice: unitPrice,
          unitPurchasePrice: 0,
          margin: 0
        }]
      };

      this.submit.emit(sale);
      return;
    }

    // charge
    const label = this.form.get('label')?.value;
    const amount = Number(this.form.get('amount')?.value || 0);
    if (!label || amount <= 0) {
      this.form.get('label')?.markAsTouched();
      this.form.get('amount')?.markAsTouched();
      return;
    }
    const charge: Charge = {
      id: (this.initial as Charge | null)?.id || Date.now().toString(),
      date: String(this.form.get('date')?.value ?? new Date().toISOString().split('T')[0]),
      label,
      amount,
      supplier: this.form.get('supplier')?.value || '' ,
      notes: this.form.get('notes')?.value || ''
    };
    this.submit.emit(charge);
  }
}