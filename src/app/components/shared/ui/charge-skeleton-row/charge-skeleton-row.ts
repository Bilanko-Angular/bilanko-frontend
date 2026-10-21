import { Component } from '@angular/core';

@Component({
  selector: '[app-charge-skeleton-row]',
  standalone: true,
  template: `
    <td><div class="skeleton-bar sk-label"></div></td>
    <td><div class="skeleton-bar sk-supplier"></div></td>
    <td class="align-right"><div class="skeleton-bar sk-amount"></div></td>
    <td><div class="skeleton-bar sk-date"></div></td>
    <td class="align-center"><div class="skeleton-bar sk-action"></div></td>
  `,
  styles: [`
    .skeleton-bar {
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

    .sk-label { width: 85%; }
    .sk-supplier { width: 70%; }
    .sk-amount { width: 80px; margin-left: auto; }
    .sk-date { width: 100px; }
    .sk-action { width: 28px; height: 28px; border-radius: 6px; margin: 0 auto; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class ChargeSkeletonRow {
}
