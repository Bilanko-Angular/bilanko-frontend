import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import type { Sale, Charge } from '../../../models/finance';

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
    if ((this.initial as Sale).product !== undefined) {
      const s = this.initial as Sale;
      this.form.patchValue({ product: s.product, quantity: s.quantity, unitPrice: s.unitPrice, client: s.client, date: s.date });
    } else {
      const c = this.initial as Charge;
      this.form.patchValue({ label: c.label, amount: c.amount, supplier: c.supplier, date: c.date });
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
      const sale: Sale = {
        id: (this.initial as Sale | null)?.id || Date.now().toString(),
        date: String(this.form.get('date')?.value ?? new Date().toISOString().split('T')[0]),
        product,
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
        client: this.form.get('client')?.value || ''
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
