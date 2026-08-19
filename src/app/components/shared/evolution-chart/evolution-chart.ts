import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  effect,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { SalesService } from '../../../services/sales.service';
import { ChargesService } from '../../../services/charges.service';

Chart.register(...registerables);

interface PointJournalier {
  date: string;
  ca: number;
  charges: number;
  marge: number;
}

@Component({
  selector: 'app-evolution-chart',
  imports: [],
  templateUrl: './evolution-chart.html',
  styleUrls: ['./evolution-chart.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionChart implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private salesService = inject(SalesService);
  private chargesService = inject(ChargesService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private chart: Chart | null = null;
  private viewReady = false;

  // Regroupe ventes + charges par date, triées chronologiquement.
  private donnees = computed<PointJournalier[]>(() => {
    const parDate = new Map<string, { ca: number; charges: number }>();

    for (const vente of this.salesService.sales()) {
      const entree = parDate.get(vente.date) ?? { ca: 0, charges: 0 };
      entree.ca += vente.totalAmount;
      parDate.set(vente.date, entree);
    }

    for (const charge of this.chargesService.charges()) {
      const entree = parDate.get(charge.date) ?? { ca: 0, charges: 0 };
      entree.charges += charge.amount;
      parDate.set(charge.date, entree);
    }

    return [...parDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, valeurs]) => ({
        date,
        ca: valeurs.ca,
        charges: valeurs.charges,
        marge: valeurs.ca - valeurs.charges,
      }));
  });

  constructor() {
    // Redessine le graphique automatiquement si les ventes/charges changent.
    effect(() => {
      const data = this.donnees();
      if (this.viewReady && this.isBrowser) {
        this.renderChart(data);
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.isBrowser) {
      this.renderChart(this.donnees());
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(data: PointJournalier[]): void {
    this.chart?.destroy();

    // On lit les couleurs directement depuis theme.css pour rester cohérent
    // avec le mode clair/sombre choisi par l'utilisateur.
    const styles = getComputedStyle(document.documentElement);
    const couleurCA = styles.getPropertyValue('--color-primary').trim() || '#63B78D';
    const couleurMarge = styles.getPropertyValue('--color-positive').trim() || '#2E5F45';
    const couleurCharges = styles.getPropertyValue('--color-negative').trim() || '#B23B3B';

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: "Chiffre d'affaires",
            data: data.map((d) => d.ca),
            borderColor: couleurCA,
            backgroundColor: couleurCA + '33',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Marge',
            data: data.map((d) => d.marge),
            borderColor: couleurMarge,
            backgroundColor: couleurMarge + '33',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Charges',
            data: data.map((d) => d.charges),
            borderColor: couleurCharges,
            backgroundColor: couleurCharges + '33',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}