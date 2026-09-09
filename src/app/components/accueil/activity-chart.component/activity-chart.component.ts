import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SaleTimeSeriesPoint } from '../../../models/overview';
import {OverviewStoreService} from '../../../service/store/overview/overview-store.service';
import {ChargeStoreService} from '../../../service/store/charge/charge-store.service';
import {smoothPath, SvgPoint} from '../../../utils/SvgPath';

interface ChartPoint {
  date: string;
  revenue: number;
  charges: number;
  margin: number;
}

const WIDTH = 700;
const HEIGHT = 320;
const PAD_LEFT = 60;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-chart.component.html',
  styleUrl: './activity-chart.component.css',
})
export class ActivityChartComponent {
  protected readonly overviewStore = inject(OverviewStoreService);
  protected readonly chargeStore = inject(ChargeStoreService);

  protected readonly chartWidth = WIDTH;
  protected readonly chartHeight = HEIGHT;

  /**
   * ChargeApiService.getAllCharges() n'accepte pas de from/to : le store charge
   * tout, on filtre et on agrège par jour côté front à partir des données déjà
   * en mémoire (pas d'appel réseau supplémentaire par changement de période).
   */
  private readonly chargesByDay = computed<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const charge of this.chargeStore.charges()) {
      const day = charge.date.slice(0, 10); // 'YYYY-MM-DD'
      map.set(day, (map.get(day) ?? 0) + charge.amount);
    }
    return map;
  });

  private readonly chartData = computed<ChartPoint[]>(() => {
    const byDay = this.chargesByDay();
    return this.overviewStore.timeSeries().map((point: SaleTimeSeriesPoint) => {
      const day = point.date.slice(0, 10);
      const charges = byDay.get(day) ?? 0;
      return {
        date: point.date,
        revenue: point.revenue,
        charges,
        margin: point.revenue - charges, // "marge simplifiée" : CA - charges du jour, pas une vraie marge comptable
      };
    });
  });

  protected readonly chart = computed(() => {
    const data = this.chartData();
    if (data.length === 0) return null;

    const allValues = data.flatMap((d) => [d.revenue, d.margin, d.charges]);
    const minValue = Math.min(0, ...allValues);
    const maxValue = Math.max(...allValues, 1);

    const usableWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const usableHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const x = (i: number) =>
      PAD_LEFT + (data.length === 1 ? usableWidth / 2 : (i / (data.length - 1)) * usableWidth);
    const y = (value: number) =>
      PAD_TOP + usableHeight - ((value - minValue) / (maxValue - minValue)) * usableHeight;

    const toPoints = (accessor: (d: ChartPoint) => number): SvgPoint[] =>
      data.map((d, i) => ({ x: x(i), y: y(accessor(d)) }));

    return {
      revenuePath: smoothPath(toPoints((d) => d.revenue)),
      marginPath: smoothPath(toPoints((d) => d.margin)),
      chargesPath: smoothPath(toPoints((d) => d.charges)),
      zeroY: y(0),
    };
  });

  protected setPeriod(from: string, to: string): void {
    this.overviewStore.setPeriod(from || undefined, to || undefined);
  }
}
