import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-search-bar',
  standalone: true,
  template: `
    <div class="skeleton-search-wrapper">
      <div class="skeleton-search-bar skeleton-bar"></div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .skeleton-search-wrapper {
      width: 50%;
      margin: 0 auto 1.25rem;
    }

    .skeleton-search-bar {
      height: 42px;
      border-radius: var(--radius-base, 8px);
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
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media screen and (max-width: 1024px) and (min-width: 768px) {
      .skeleton-search-wrapper { width: 70%; }
    }
    @media screen and (max-width: 768px) {
      .skeleton-search-wrapper { width: 100%; }
    }
  `],
})
export class SkeletonSearchBar {}
