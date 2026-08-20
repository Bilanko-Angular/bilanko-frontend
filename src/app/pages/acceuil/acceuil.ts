import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { RouterLink } from '@angular/router';

import { Template } from '../../components/shared/template/template';

import { SalesService } from '../../services/sales.service';

import { ChargesService } from '../../services/charges.service';

import { EvolutionChart } from '../../components/shared/evolution-chart/evolution-chart';

@Component({
  selector: 'app-acceuil',
  standalone: true,

  imports: [
    Template,
    DecimalPipe,
    RouterLink,
    EvolutionChart
  ],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class Acceuil {


  // ============================================================
  // SERVICES
  // ============================================================

  private readonly salesService =
    inject(SalesService);

  private readonly chargesService =
    inject(ChargesService);


  // ============================================================
  // DONNÉES
  // ============================================================

  readonly sales =
    this.salesService.sales;

  readonly charges =
    this.chargesService.charges;


  // ============================================================
  // KPI
  // ============================================================

  readonly chiffreAffaires = computed(() =>

    this.sales().reduce(
      (total, vente) =>
        total + vente.totalAmount,
      0
    )

  );


  readonly totalCharges = computed(() =>

    this.charges().reduce(
      (total, charge) =>
        total + charge.amount,
      0
    )

  );


  /**
   * Résultat simplifié :
   * chiffre d'affaires - charges.
   */
  readonly marge = computed(() =>

    this.chiffreAffaires()
    - this.totalCharges()

  );


  readonly nombreVentes = computed(() =>

    this.sales().length

  );


  // ============================================================
  // DERNIÈRES ACTIVITÉS
  // ============================================================

  readonly dernieresVentes = computed(() =>

    this.sales().slice(0, 5)

  );


  readonly dernieresCharges = computed(() =>

    this.charges().slice(0, 5)

  );

}