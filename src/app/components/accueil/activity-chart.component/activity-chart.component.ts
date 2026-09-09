import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { SaleTimeSeriesPoint } from '../../../models/overview';
import { OverviewStoreService } from '../../../service/store/overview/overview-store.service';
import { ChargeStoreService } from '../../../service/store/charge/charge-store.service';
import { smoothPath, SvgPoint } from '../../../utils/SvgPath';

interface ChartPoint {
  date: string;
  revenue: number;
  charges: number;
  margin: number;
}

interface ChartDot {
  x: number;
  y: number;
}

interface SeriesPaths {
  line: string;
  area: string;
  dots: ChartDot[];
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

  private readonly chargesByDay = computed<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const charge of this.chargeStore.charges()) {
      const day = charge.date.slice(0, 10);
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
        date: day,
        revenue: point.revenue,
        charges,
        margin: point.revenue - charges,
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

    const buildSeries = (accessor: (d: ChartPoint) => number): SeriesPaths => {
      const points = toPoints(accessor);
      const line = smoothPath(points);
      const first = points[0];
      const last = points[points.length - 1];
      const zeroY = y(0);
      const area = `${line} L${last.x.toFixed(2)},${zeroY.toFixed(2)} L${first.x.toFixed(2)},${zeroY.toFixed(2)} Z`;
      return {
        line,
        area,
        dots: points.map((p) => ({ x: p.x, y: p.y })),
      };
    };

    const yTicks = this.buildYTicks(minValue, maxValue).map((value) => ({
      value,
      y: y(value),
      label: this.formatAxisValue(value),
    }));

    return {
      revenue: buildSeries((d) => d.revenue),
      margin: buildSeries((d) => d.margin),
      charges: buildSeries((d) => d.charges),
      zeroY: y(0),
      yTicks,
      xTicks: data.map((d, i) => ({
        x: x(i),
        label: d.date,
        anchor: i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle',
      })),
      plotTop: PAD_TOP,
      plotBottom: HEIGHT - PAD_BOTTOM,
    };
  });

  protected setPeriod(from: string, to: string): void {
    this.overviewStore.setPeriod(from || undefined, to || undefined);
  }

  private buildYTicks(min: number, max: number): number[] {
    const span = max - min || 1;
    const roughStep = span / 6;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;
    const step =
      residual <= 1 ? magnitude : residual <= 2 ? 2 * magnitude : residual <= 5 ? 5 * magnitude : 10 * magnitude;

    const ticks: number[] = [];
    const start = Math.floor(min / step) * step;
    for (let v = start; v <= max + step / 2; v += step) {
      ticks.push(Math.round(v));
    }
    if (!ticks.includes(0) && min <= 0 && max >= 0) {
      ticks.push(0);
      ticks.sort((a, b) => b - a);
    } else {
      ticks.sort((a, b) => b - a);
    }
    return ticks;
  }

  private formatAxisValue(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  }
}
