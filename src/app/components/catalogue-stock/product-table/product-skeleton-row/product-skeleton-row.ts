import { Component, input } from '@angular/core';

@Component({
  selector: '[app-product-skeleton-row]',
  standalone: true,
  template: `
      @for (col of columns(); track $index) {
        <td><div class="skeleton-bar"></div></td>
      }
  `,
  styles: [`
    .skeleton-bar {
      height: 14px;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--color-border) 25%, var(--color-surface) 50%, var(--color-border) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class ProductSkeletonRow {
  columns = input<number[]>([1, 2, 3, 4, 5, 6]);
}