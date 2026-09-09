// src/app/pages/acceuil/acceuil.ts
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {Template} from '../../components/shared/template/template';
import {KpiRowComponent} from '../../components/accueil/kpi-row.component/kpi-row.component';
import {ActivityChartComponent} from '../../components/accueil/activity-chart.component/activity-chart.component';
import {SalesTableComponent} from '../../components/accueil/sale-table.component/sale-table.component';
import {StockAlertsComponent} from '../../components/accueil/stock-alert.component/stock-alert.component';
import {ChargesDonutComponent} from '../../components/accueil/charges-donut.component/charges-donut.component';


@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [
    Template,
    KpiRowComponent,
    ActivityChartComponent,
    SalesTableComponent,
    StockAlertsComponent,
    ChargesDonutComponent
  ],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Acceuil {

}
