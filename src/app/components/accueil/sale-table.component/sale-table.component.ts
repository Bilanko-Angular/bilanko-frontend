import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Sale } from '../../../models/sale';
import { VenteStoreService } from '../../../service/store/vente/vente-store.service';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sale-table.component.html',
  styleUrl: './sale-table.component.css',
})
export class SalesTableComponent {
  protected readonly venteStore = inject(VenteStoreService);

  protected readonly latestSales = computed<Sale[]>(() =>
    [...this.venteStore.sales()]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5)
  );
}
