import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueStocks } from './catalogue-stocks';

describe('CatalogueStocks', () => {
  let component: CatalogueStocks;
  let fixture: ComponentFixture<CatalogueStocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogueStocks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogueStocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
