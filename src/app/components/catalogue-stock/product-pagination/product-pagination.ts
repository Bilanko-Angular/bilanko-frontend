// product-pagination.ts
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-product-pagination',
  standalone: true,
  templateUrl: './product-pagination.html',
})
export class ProductPagination {
  readonly pageCourante = input.required<number>(); // 0-indexée
  readonly totalPages = input.required<number>();
  readonly totalElements = input<number>(0);
  readonly parPage = input<number>(10);

  readonly changerPage = output<number>();

  readonly pagesAffichees = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  readonly debutAffiche = computed(() => this.pageCourante() * this.parPage() + 1);
  readonly finAffiche = computed(() =>
    Math.min((this.pageCourante() + 1) * this.parPage(), this.totalElements())
  );

  precedente() {
    if (this.pageCourante() > 0) this.changerPage.emit(this.pageCourante() - 1);
  }

  suivante() {
    if (this.pageCourante() < this.totalPages() - 1) this.changerPage.emit(this.pageCourante() + 1);
  }

  allerA(page: number) {
    this.changerPage.emit(page);
  }
}