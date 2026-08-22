import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDeleteModal } from './product-delete-modal';

describe('ProductDeleteModal', () => {
  let component: ProductDeleteModal;
  let fixture: ComponentFixture<ProductDeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDeleteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDeleteModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
