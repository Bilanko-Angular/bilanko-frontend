import { Component } from '@angular/core';
import { PreferencesService } from '../../../../service/app/preference/preferences';
import { inject } from '@angular/core';

@Component({
  selector: '[app-sale-skeleton-row]',
  standalone: true,
  template: `
    <td [attr.data-label]="prefs.t().date">
      <div class="skeleton-bar sk-date"></div>
    </td>
    <td [attr.data-label]="prefs.t().client">
      <div class="skeleton-bar sk-client"></div>
    </td>
    <td [attr.data-label]="prefs.t().products" class="align-center">
      <div class="skeleton-bar sk-small"></div>
    </td>
    <td [attr.data-label]="prefs.t().totalAmount" class="align-right">
      <div class="skeleton-bar sk-amount"></div>
    </td>
    <td [attr.data-label]="prefs.t().simplifiedMargin" class="align-right">
      <div class="skeleton-bar sk-amount"></div>
    </td>
    <td [attr.data-label]="prefs.t().actions" class="align-center">
      <div class="skeleton-bar sk-action"></div>
    </td>
  `,
  styles: [`
    .skeleton-bar {
      width: 100%;
      height: 14px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--color-border) 25%,
        var(--color-surface) 50%,
        var(--color-border) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Largeurs spécifiques par colonne */
    .sk-date   { width: 120px; }
    .sk-client { width: 90%; }
    .sk-small  { width: 30px; margin: 0 auto; }
    .sk-amount { width: 80px; margin-left: auto; }
    .sk-action { width: 28px; height: 28px; border-radius: 6px; margin: 0 auto; }

    /* Sur mobile le parent met display:flex sur chaque td → la barre prend le reste */
    :host td .skeleton-bar { flex: 1; }
  `],
})
export class SaleSkeletonRow {
  protected readonly prefs = inject(PreferencesService);
}
