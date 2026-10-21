import { Component } from '@angular/core';

@Component({
  selector: '[app-product-skeleton-row]',
  standalone: true,
  template: `
    <td data-label="Produit">
      <div class="sk-product">
        <div class="skeleton-bar sk-name"></div>
        <div class="skeleton-bar sk-ref"></div>
      </div>
    </td>
    <td data-label="Catégorie"><div class="skeleton-bar sk-badge"></div></td>
    <td class="text-center" data-label="Qté stock"><div class="skeleton-bar sk-num"></div></td>
    <td class="text-center" data-label="Seuil"><div class="skeleton-bar sk-num"></div></td>
    <td data-label="Marge"><div class="skeleton-bar sk-amount"></div></td>
    <td class="td-actions"><div class="skeleton-bar sk-actions"></div></td>
  `,
  styles: [`
    .skeleton-bar {
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

    /* Dimensions des barres squelettes */
    .sk-product { display: flex; flex-direction: column; gap: 6px; }
    .sk-name    { height: 14px; width: 70%; }
    .sk-ref     { height: 10px; width: 45%; }
    .sk-badge   { height: 22px; width: 80px; border-radius: 999px; }
    .sk-num     { height: 14px; width: 40px; margin: 0 auto; }
    .sk-amount  { height: 14px; width: 90px; margin-left: auto; }
    .sk-actions { height: 28px; width: 90px; border-radius: 6px; margin: 0 auto; }

    /* Sur mobile, le parent met display:flex sur chaque td.
       On s'assure que la skeleton-bar prend toute la largeur restante. */
    :host td .skeleton-bar { flex: 1; }
  `],
})
export class ProductSkeletonRow {}