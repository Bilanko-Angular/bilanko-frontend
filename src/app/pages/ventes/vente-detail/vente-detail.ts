import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Template } from '../../../components/shared/template/template';
import { SalesService } from '../../../services/sales.service';
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-vente-detail',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, Template],
  templateUrl: './vente-detail.html',
  styleUrl: './vente-detail.css',
})
export class VenteDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private salesService = inject(SalesService);
  protected readonly prefs = inject(PreferencesService);

  readonly sale = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.salesService.getById(id) : undefined;
  });

  retour(): void {
    this.router.navigate(['/ventes']);
  }
}