import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Template } from '../../components/shared/template/template';
import { SalesService } from '../../services/sales.service';
import { ChargesService } from '../../services/charges.service';
import { EvolutionChart } from '../../components/shared/evolution-chart/evolution-chart';


@Component({
  selector: 'app-acceuil',
  imports: [Template, DecimalPipe, RouterLink , EvolutionChart],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Acceuil {
  private salesService = inject(SalesService);
  private chargesService = inject(ChargesService);

  sales = this.salesService.sales;
  charges = this.chargesService.charges;

  chiffreAffaires = computed(() =>
    this.sales().reduce((total, vente) => total + vente.totalAmount, 0)
  );

  totalCharges = computed(() =>
    this.charges().reduce((total, charge) => total + charge.amount, 0)
  );

  marge = computed(() => this.chiffreAffaires() - this.totalCharges());

  dernieresVentes = computed(() => this.sales().slice(0, 5));
  dernieresCharges = computed(() => this.charges().slice(0, 5));
}