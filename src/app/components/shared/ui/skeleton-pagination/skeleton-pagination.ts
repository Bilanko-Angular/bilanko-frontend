import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-skeleton-pagination',
  standalone: true,
  template: `
    <div class="skeleton-pagination">
      <div class="skeleton-btn skeleton-bar"></div>
      <div class="skeleton-indicator skeleton-bar"></div>
      <div class="skeleton-btn skeleton-bar"></div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .skeleton-pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.25rem;
      margin-top: 1.25rem;
    }

    .skeleton-bar {
      background: linear-gradient(
        90deg,
        var(--color-border) 25%,
        var(--color-surface) 50%,
        var(--color-border) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: var(--radius-base, 8px);
    }

    .skeleton-btn {
      width: 90px;
      height: 38px;
    }

    .skeleton-indicator {
      width: 140px;
      height: 20px;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonPagination {}
