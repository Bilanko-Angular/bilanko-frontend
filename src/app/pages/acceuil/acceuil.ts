import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Template } from '../../components/shared/template/template';
import { SalesService } from '../../services/sales.service';
import { ChargesService } from '../../services/charges.service';
import { EvolutionChart } from '../../components/shared/evolution-chart/evolution-chart';

@Component({
  selector: 'app-acceuil',
  imports: [
    Template,
    DecimalPipe,
    RouterLink,
    EvolutionChart
  ],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Acceuil {

  // =========================================================
  // SERVICES
  // =========================================================

  private salesService = inject(SalesService);
  private chargesService = inject(ChargesService);


  // =========================================================
  // DONNÉES
  // =========================================================

  sales = this.salesService.sales;

  charges = this.chargesService.charges;


  // =========================================================
  // INDICATEURS DU DASHBOARD
  // =========================================================

  /**
   * Chiffre d'affaires total
   *
   * On additionne le montant de toutes les ventes.
   */
  chiffreAffaires = computed(() =>
    this.sales().reduce(
      (total, vente) => total + vente.totalAmount,
      0
    )
  );


  /**
   * Total des charges
   *
   * On additionne toutes les charges enregistrées.
   */
  totalCharges = computed(() =>
    this.charges().reduce(
      (total, charge) => total + charge.amount,
      0
    )
  );


  /**
   * Marge simplifiée
   *
   * Pour notre démonstration actuelle :
   * CA - Charges
   *
   * Plus tard, lorsque les prix d'achat
   * seront reliés aux produits, nous pourrons
   * calculer une marge commerciale plus précise.
   */
  marge = computed(() =>
    this.chiffreAffaires() - this.totalCharges()
  );


  /**
   * Nombre total de ventes
   */
  nombreVentes = computed(() =>
    this.sales().length
  );


  // =========================================================
  // DERNIÈRES DONNÉES
  // =========================================================

  /**
   * Les 5 ventes les plus récentes
   *
   * Nos données sont déjà placées de manière
   * à ce que les dernières apparaissent en premier.
   */
  dernieresVentes = computed(() =>
    this.sales().slice(0, 5)
  );


  /**
   * Les 5 dernières charges
   */
  dernieresCharges = computed(() =>
    this.charges().slice(0, 5)
  );
}