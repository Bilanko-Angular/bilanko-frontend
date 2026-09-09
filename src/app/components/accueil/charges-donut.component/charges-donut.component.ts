import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Charge } from '../../../models/finance';
import { ChargeStoreService } from '../../../service/store/charge/charge-store.service';

interface SupplierSlice {
  supplier: string;
  amount: number;
  percent: number;
  frequency: string;
}

interface DonutSegment extends SupplierSlice {
  color: string;
  dasharray: string;
  dashoffset: number;
}

/** Palette alignée sur le mock HTML / thème Bilanko (clair → foncé). */
const DONUT_COLORS = ['#022C22', '#04C966', '#05DF72', '#83A393', '#D1FAE5', '#B7CFC2'];
const RADIUS = 60;

@Component({
  selector: 'app-charges-donut',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './charges-donut.component.html',
  styleUrl: './charges-donut.component.css',
})
export class ChargesDonutComponent {
  protected readonly chargeStore = inject(ChargeStoreService);
  protected readonly radius = RADIUS;
  protected readonly tooltip = signal<string | null>(null);

  protected readonly totalCharges = computed(() =>
    this.chargeStore.charges().reduce((sum, c: Charge) => sum + c.amount, 0)
  );

  private readonly supplierSlices = computed<SupplierSlice[]>(() => {
    const byGroup = new Map<string, { amount: number; dates: string[] }>();
    for (const charge of this.chargeStore.charges()) {
      const key = charge.supplier?.trim() || 'Autre';
      const entry = byGroup.get(key) ?? { amount: 0, dates: [] };
      entry.amount += charge.amount;
      entry.dates.push(charge.date);
      byGroup.set(key, entry);
    }

    const total = [...byGroup.values()].reduce((sum, v) => sum + v.amount, 0);
    if (total === 0) return [];

    return [...byGroup.entries()]
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([supplier, { amount, dates }]) => ({
        supplier,
        amount,
        percent: (amount / total) * 100,
        frequency: this.frequencyLabel(dates),
      }));
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

  protected showTooltip(segment: DonutSegment): void {
    this.tooltip.set(`${segment.supplier} (${segment.percent.toFixed(0)}%)`);
  }

  protected hideTooltip(): void {
    this.tooltip.set(null);
  }

  /** Fréquence dérivée des dates réelles des charges du fournisseur (pas de mock). */
  private frequencyLabel(dates: string[]): string {
    if (dates.length <= 1) {
      return 'Fréquence : Rare';
    }

    const sorted = dates
      .map((d) => new Date(d).getTime())
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => a - b);

    if (sorted.length <= 1) {
      return 'Fréquence : Rare';
    }

    let gapSum = 0;
    for (let i = 1; i < sorted.length; i++) {
      gapSum += (sorted[i] - sorted[i - 1]) / 86_400_000;
    }
    const avgDays = gapSum / (sorted.length - 1);

    if (avgDays <= 8) return 'Fréquence : Très élevée (Hebdomadaire)';
    if (avgDays <= 14) return 'Fréquence : Élevée (3x / mois)';
    if (avgDays <= 21) return 'Fréquence : Régulière (2x / mois)';
    if (avgDays <= 45) return 'Fréquence : Occasionnelle';
    return 'Fréquence : Rare';
  }
}
