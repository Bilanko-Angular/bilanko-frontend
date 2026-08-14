import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common'; // Import ciblé pour de meilleures performances

// Interface simulant notre modèle de données pour une vente
interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  client: string;
}

@Component({
  selector: 'app-ventes',
  standalone: true,
  // On importe uniquement ce dont on a besoin (fini le CommonModule global)
  imports: [ReactiveFormsModule, DecimalPipe], 
  templateUrl: './ventes.html',
  styleUrl: './ventes.css', // "styleUrl" (singulier) est la nouvelle norme
  changeDetection: ChangeDetectionStrategy.OnPush // Indispensable avec les Signals
})
export class SalesComponent {
  // --- INJECTION MODERNE (via la fonction inject()) ---
  private fb = inject(FormBuilder);

  // --- GESTION DES POP-UPS (avec les Signals Angular) ---
  isFilterModalOpen = signal(false);
  isAddModalOpen = signal(false);
  openMenuId = signal<string | null>(null); 

  // --- DONNÉES SIMULÉES ---
  availableStock = 50; 

  sales = signal<Sale[]>([
    { id: '1', date: '2026-08-14', product: 'Sac de riz 25kg', quantity: 2, unitPrice: 15000, totalAmount: 30000, client: 'Restaurant Le Palo' },
    { id: '2', date: '2026-08-14', product: 'Caisse de boissons', quantity: 5, unitPrice: 4000, totalAmount: 20000, client: 'Client comptant' }
  ]);

  // --- FORMULAIRE D'AJOUT (Typage strict moderne) ---
  // Utilisation directe de this.fb injecté plus haut
  saleForm: FormGroup = this.fb.group({
    product: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    client: ['']
  });

  // --- MÉTHODES POUR LES MODALES ---
  openAddModal() {
    this.isAddModalOpen.set(true);
    this.openMenuId.set(null); 
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
    this.saleForm.reset({ quantity: 1 }); 
  }

  openFilterModal() {
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal() {
    this.isFilterModalOpen.set(false);
  }

  // --- MÉTHODES POUR LE MENU D'ACTIONS ---
  toggleActionMenu(saleId: string) {
    this.openMenuId.update(currentId => (currentId === saleId ? null : saleId));
  }

  editSale(saleId: string) {
    console.log('Modifier la vente :', saleId);
    this.openMenuId.set(null); 
  }

  deleteSale(saleId: string) {
    const confirmation = confirm('Voulez-vous vraiment supprimer cette vente ? Le stock sera recrédité.');
    if (confirmation) {
      this.sales.update(sales => sales.filter(s => s.id !== saleId));
    }
    this.openMenuId.set(null); 
  }

  // --- SOUMISSION DU FORMULAIRE ---
  onSubmit() {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    const formValue = this.saleForm.value;

    // Vérification du stock
    if (formValue.quantity > this.availableStock) {
      this.saleForm.get('quantity')?.setErrors({ stockError: true });
      return; 
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      product: formValue.product,
      quantity: formValue.quantity,
      unitPrice: 15000, 
      totalAmount: formValue.quantity * 15000,
      client: formValue.client || 'Client comptant'
    };

    this.sales.update(sales => [newSale, ...sales]);
    this.closeAddModal();
  }
}
