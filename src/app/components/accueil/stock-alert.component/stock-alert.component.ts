import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductApiService } from '../../../service/api/product/product-api.service';
import type { Produit } from '../../../models/produit';

interface StockAlertItem {
  id: string;
  name: string;
  qty: number;
  severity: 'low' | 'mid';
  subtitle: string;
}

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-alert.component.html',
  styleUrl: './stock-alert.component.css',
})
export class StockAlertsComponent implements OnInit {
  private readonly productApi = inject(ProductApiService);

  protected readonly isLoading = signal(false);
  protected readonly alerts = signal<StockAlertItem[]>([]);

  protected readonly hasAlerts = computed(() => this.alerts().length > 0);

  ngOnInit(): void {
    void this.loadAlerts();
  }

  private async loadAlerts(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Charge le catalogue marchand puis filtre localement (évite de polluer ProduitStore).
      const products = await this.productApi.getMine();
      const items = products
        .filter((p) => p.quantiteStock <= p.seuilAlerte)
        .map((p) => this.toAlert(p))
        .sort((a, b) => a.qty - b.qty)
        .slice(0, 5);
      this.alerts.set(items);
    } catch (err) {
      console.error('StockAlerts: erreur chargement', err);
      this.alerts.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private toAlert(produit: Produit): StockAlertItem {
    const critical = produit.quantiteStock === 0 || produit.quantiteStock <= Math.max(1, Math.floor(produit.seuilAlerte / 2));
    return {
      id: produit.id,
      name: produit.nom,
      qty: produit.quantiteStock,
      severity: critical ? 'low' : 'mid',
      subtitle: produit.quantiteStock === 0
        ? 'Rupture de stock'
        : critical
          ? "Seuil d'alerte atteint"
          : 'Stock bas',
    };
  }
}
