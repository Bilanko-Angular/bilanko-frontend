import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProduitStoreService} from '../../../service/store/product/produit-store.service';
import {OverviewStoreService} from '../../../service/store/overview/overview-store.service';



@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-alert.component.html',
  styleUrl: './stock-alert.component.css',
})
export class StockAlertsComponent {
  protected readonly produitStore = inject(ProduitStoreService);
  protected readonly overviewStore = inject(OverviewStoreService);

  /** StockOverview ne donne que des compteurs globaux (lowStockCount / outOfStockCount). */
  protected readonly stock = computed(() => this.overviewStore.summary()?.stock ?? null);

  constructor() {
    // ⚠️ 'warning' est une supposition pour "stock bas" (RechercheParams n'a que
    // 'tous' | 'ok' | 'warning' | 'error') — confirme la sémantique exacte de ces
    // 3 statuts côté backend avant de considérer ce filtre comme définitif.
    void this.produitStore.rechercher({ stockStatus: 'warning' });
  }
}
