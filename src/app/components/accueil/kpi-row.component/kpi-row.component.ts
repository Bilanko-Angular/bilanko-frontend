import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// ⚠️ Adapte les chemins d'import ci-dessous à l'emplacement réel des fichiers dans ton projet.
import type { OverviewSummary } from '../../../models/overview';
import {OverviewStoreService} from '../../../service/store/overview/overview-store.service';
import {OverviewApiService} from '../../../service/api/overview/overview-api.service';

interface KpiTrend {
  percent: number;
  direction: 'up' | 'down';
}

interface KpiDef {
  label: string;
  value: number;
  trend: KpiTrend | null;
  format: 'currency' | 'count';
}

@Component({
  selector: 'app-kpi-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-row.component.html',
  styleUrl: './kpi-row.component.css',
})
export class KpiRowComponent {
  protected readonly overviewStore = inject(OverviewStoreService);
  private readonly overviewApi = inject(OverviewApiService);

  /**
   * OverviewSummaryDTO n'a pas de champ de tendance côté backend.
   * On calcule la période précédente (même durée, juste avant `from`) et on
   * refait un appel getSummary() pour obtenir le delta. Ce composant est seul
   * responsable de cette logique — elle ne pollue pas OverviewStoreService.
   */
  private readonly previousSummary = signal<OverviewSummary | null>(null);
  protected readonly isLoadingPrevious = signal(false);

  constructor() {
    effect(() => {
      const current = this.overviewStore.summary();
      if (!current?.from || !current?.to) {
        this.previousSummary.set(null);
        return;
      }
      void this.loadPreviousPeriod(current.from, current.to);
    });
  }

  private async loadPreviousPeriod(from: string, to: string): Promise<void> {
    const start = new Date(from);
    const end = new Date(to);
    const durationMs = end.getTime() - start.getTime();
    const prevTo = new Date(start.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - durationMs);

    this.isLoadingPrevious.set(true);
    try {
      const summary = await this.overviewApi.getSummary(prevFrom.toISOString(), prevTo.toISOString());
      this.previousSummary.set(summary);
    } catch (err) {
      console.error('KpiRow: erreur chargement période précédente', err);
      this.previousSummary.set(null);
    } finally {
      this.isLoadingPrevious.set(false);
    }
  }

  /** Trend nul si pas de donnée précédente ou variation négligeable (< 0,05 %). */
  private trend(current?: number, previous?: number): KpiTrend | null {
    if (current === undefined || previous === undefined || previous === 0) return null;
    const percent = ((current - previous) / Math.abs(previous)) * 100;
    if (Math.abs(percent) < 0.05) return null;
    return { percent: Math.abs(percent), direction: percent > 0 ? 'up' : 'down' };
  }

  protected readonly kpis = computed<KpiDef[]>(() => {
    const s = this.overviewStore.summary();
    const p = this.previousSummary();
    return [
      { label: "Chiffre d'affaires", value: s?.revenue ?? 0, trend: this.trend(s?.revenue, p?.revenue), format: 'currency' },
      { label: 'Charges', value: s?.totalCharges ?? 0, trend: this.trend(s?.totalCharges, p?.totalCharges), format: 'currency' },
      { label: 'Marge', value: s?.grossMargin ?? 0, trend: this.trend(s?.grossMargin, p?.grossMargin), format: 'currency' },
      { label: 'Ventes', value: s?.salesCount ?? 0, trend: this.trend(s?.salesCount, p?.salesCount), format: 'count' },
    ];
  });
}
