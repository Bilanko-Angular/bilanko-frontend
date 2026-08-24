import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSkeletonRow } from './product-skeleton-row';

describe('ProductSkeletonRow', () => {
  let component: ProductSkeletonRow;
  let fixture: ComponentFixture<ProductSkeletonRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSkeletonRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSkeletonRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
