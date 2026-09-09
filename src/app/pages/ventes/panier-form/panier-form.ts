import { Component, EventEmitter, Input, Output, inject, signal, computed, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { PreferencesService } from '../../../services/preferences';
import { ProduitStoreService } from '../../../service/store/product/produit-store.service';
import type { Produit } from '../../../models/produit';
import type { Sale, SaleItem } from '../../../models/sale';

@Component({
  selector: 'app-panier-form',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './panier-form.html',
  styleUrl: './panier-form.css',
})
export class PanierForm implements OnInit {
  protected readonly prefs = inject(PreferencesService);
  private readonly produitStore = inject(ProduitStoreService);

  @Input() initial: Sale | null = null;
  @Output() submitSale = new EventEmitter<Omit<Sale, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  customerName = signal('');
  saleDateTime = signal(this.toLocalDateTimeInput(new Date()));
  panier = signal<SaleItem[]>([]);

  productQuery = signal('');
  showSuggestions = signal(false);
  selectedProductId = signal('');
  selectedQuantity = signal(1);
  stockWarning = signal('');

  readonly filteredProducts = computed<Produit[]>(() => {
    const q = this.productQuery().trim().toLowerCase();
    const list = this.produitStore.catalogueVente();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q)
    );
  });

  private toLocalDateTimeInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  constructor() {
    effect(() => {
      if (this.initial) {
        this.customerName.set(this.initial.customerName);
        this.saleDateTime.set(this.toLocalDateTimeInput(new Date(this.initial.saleDate)));
        this.panier.set([...this.initial.items]);
      }
    });
  }

  ngOnInit(): void {
    void this.produitStore.loadCatalogueVente();
  }

  readonly produitSelectionne = computed(() => {
    const id = this.selectedProductId();
    return this.produitStore.catalogueVente().find((p) => p.id === id);
  });

  readonly total = computed(() =>
    this.panier().reduce((sum, item) => sum + item.unitSellingPrice * item.quantity, 0)
  );

  readonly totalMargin = computed(() =>
    this.panier().reduce((sum, item) => sum + (item.margin ?? 0), 0)
  );

  onProductQueryChange(value: string): void {
    this.productQuery.set(value);
    this.showSuggestions.set(true);

    const match = this.produitStore.catalogueVente().find(
      (p) => p.nom.toLowerCase() === value.trim().toLowerCase()
    );
    this.selectedProductId.set(match ? match.id : '');
  }

  onProductFocus(): void {
    this.showSuggestions.set(true);
  }

  onProductBlur(): void {
    setTimeout(() => this.showSuggestions.set(false), 150);
  }

  selectProduct(p: Produit): void {
    this.selectedProductId.set(p.id);
    this.productQuery.set(p.nom);
    this.showSuggestions.set(false);
  }

  ajouterAuPanier(): void {
    const produit = this.produitSelectionne();
    const qty = this.selectedQuantity();
    this.stockWarning.set('');

    if (!produit) return;

    const dejaDansPanier = this.panier()
      .filter((i) => i.productId === produit.id)
      .reduce((s, i) => s + i.quantity, 0);

    if (dejaDansPanier + qty > produit.quantiteStock) {
      this.stockWarning.set(
        `${this.prefs.t().invalidQuantity} (${this.prefs.t().stockQty}: ${produit.quantiteStock})`
      );
      return;
    }

    const margeUnitaire = produit.prixVente - produit.prixAchat;

    this.panier.update((curr) => [
      ...curr,
      {
        productId: produit.id,
        productName: produit.nom,
        quantity: qty,
        unitSellingPrice: produit.prixVente,
        unitPurchasePrice: produit.prixAchat,
        margin: margeUnitaire * qty,
      },
    ]);

    this.selectedProductId.set('');
    this.productQuery.set('');
    this.selectedQuantity.set(1);
  }

  retirerDuPanier(index: number): void {
    this.panier.update((curr) => curr.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.panier().length === 0) return;

    // ISO LocalDateTime attendu par le backend (sans Z pour LocalDateTime)
    const raw = new Date(this.saleDateTime());
    const pad = (n: number) => String(n).padStart(2, '0');
    const saleDate =
      `${raw.getFullYear()}-${pad(raw.getMonth() + 1)}-${pad(raw.getDate())}` +
      `T${pad(raw.getHours())}:${pad(raw.getMinutes())}:${pad(raw.getSeconds())}`;

    this.submitSale.emit({
      customerName: this.customerName().trim() || this.prefs.t().comptantClient,
      saleDate,
      totalAmount: this.total(),
      totalMargin: this.totalMargin(),
      items: this.panier(),
    });
  }
}
