// src/app/pages/acceuil/acceuil.ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Template } from '../../components/shared/template/template';
import { KpiRowComponent } from '../../components/accueil/kpi-row.component/kpi-row.component';
import { ActivityChartComponent } from '../../components/accueil/activity-chart.component/activity-chart.component';
import { SalesTableComponent } from '../../components/accueil/sale-table.component/sale-table.component';
import { StockAlertsComponent } from '../../components/accueil/stock-alert.component/stock-alert.component';
import { ChargesDonutComponent } from '../../components/accueil/charges-donut.component/charges-donut.component';
import { UserStoreService } from '../../service/store/user/user-store.service';
import { PreferencesService } from '../../services/preferences';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [
    Template,
    RouterLink,
    KpiRowComponent,
    ActivityChartComponent,
    SalesTableComponent,
    StockAlertsComponent,
    ChargesDonutComponent,
  ],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Acceuil {
  private readonly userStore = inject(UserStoreService);
  protected readonly prefs = inject(PreferencesService);

  protected readonly firstName = computed(() => {
    const nom = this.userStore.user()?.nom?.trim();
    return nom || 'marchand';
  });

  protected readonly todayLabel = computed(() =>
    new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    })
  );
}
