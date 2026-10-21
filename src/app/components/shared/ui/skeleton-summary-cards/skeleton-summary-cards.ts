import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-summary-cards',
  standalone: true,
  imports: [],
  templateUrl: './skeleton-summary-cards.html',
  styleUrl: './skeleton-summary-cards.css',
})
export class SkeletonSummaryCards {
  count = input<number>(4);
  readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
