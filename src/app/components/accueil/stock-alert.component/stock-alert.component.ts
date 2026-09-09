import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProduitStoreService} from '../../../service/store/product/produit-store.service';
import {OverviewStoreService} from '../../../service/store/overview/overview-store.service';



@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-alerts.component.html',
  styleUrl: './stock-alerts.component.css',
})
export class StockAlertsComponent {
  protected readonly produitStore = inject(ProduitStoreService);
  protected readonly overviewStore = inject(OverviewStoreService);

  /** StockOverview ne donne que des compteurs globaux (lowStockCount / outOfStockCount). */
  protected readonly stock = computed(() => this.overviewStore.summary()?.stock ?? null);

  constructor() {
    // La liste nominative (nom produit + quantité restante) n'existe pas dans StockOverview,
    // on la charge séparément via le filtre stockStatus de ProduitStoreService.
    void this.produitStore.rechercher({ stockStatus: 'LOW' });
  }
}
