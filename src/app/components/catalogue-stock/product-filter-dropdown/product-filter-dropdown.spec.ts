import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFilterDropdown } from './product-filter-dropdown';

describe('ProductFilterDropdown', () => {
  let component: ProductFilterDropdown;
  let fixture: ComponentFixture<ProductFilterDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFilterDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFilterDropdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
