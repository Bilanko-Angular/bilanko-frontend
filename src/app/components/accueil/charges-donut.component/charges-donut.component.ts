import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Charge } from '../../../models/finance';
import {ChargeStoreService} from '../../../service/store/charge/charge-store.service';

interface SupplierSlice {
  supplier: string;
  amount: number;
  percent: number;
}

interface DonutSegment extends SupplierSlice {
  color: string;
  dasharray: string;
  dashoffset: number;
}

// Palette dérivée de --bilanko-primary / --bilanko-positive (theme.css), du plus foncé au plus clair.
const DONUT_COLORS = ['#022C22', '#04C966', '#05DF72', '#83A393', '#D1FAE5', '#B7CFC2'];
const RADIUS = 60;

@Component({
  selector: 'app-charges-donut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charges-donut.component.html',
  styleUrl: './charges-donut.component.css',
})
export class ChargesDonutComponent {
  protected readonly chargeStore = inject(ChargeStoreService);
  protected readonly radius = RADIUS;

  protected readonly totalCharges = computed(() =>
    this.chargeStore.charges().reduce((sum, c: Charge) => sum + c.amount, 0)
  );

  /**
   * Agrégation sur TOUTES les charges du store (pas de filtre sur la période
   * du graphe d'activité) — cohérent avec le mockup d'origine.
   */
  private readonly supplierSlices = computed<SupplierSlice[]>(() => {
    const byGroup = new Map<string, number>();
    for (const charge of this.chargeStore.charges()) {
      const key = charge.supplier ?? 'Autre';
      byGroup.set(key, (byGroup.get(key) ?? 0) + charge.amount);
    }
    const total = [...byGroup.values()].reduce((sum, v) => sum + v, 0);
    if (total === 0) return [];

    return [...byGroup.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([supplier, amount]) => ({ supplier, amount, percent: (amount / total) * 100 }));
  });

  protected readonly segments = computed<DonutSegment[]>(() => {
    const circumference = 2 * Math.PI * RADIUS;
    let cumulative = 0;
    return this.supplierSlices().map((slice, i) => {
      const length = (slice.percent / 100) * circumference;
      const segment: DonutSegment = {
        ...slice,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
        dasharray: `${length.toFixed(1)} ${(circumference - length).toFixed(1)}`,
        dashoffset: -cumulative,
      };
      cumulative += length;
      return segment;
    });
  });
}
