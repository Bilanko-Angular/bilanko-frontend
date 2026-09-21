import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapitalFinancialNeeds } from './capital-financial-needs';

describe('CapitalFinancialNeeds', () => {
  let component: CapitalFinancialNeeds;
  let fixture: ComponentFixture<CapitalFinancialNeeds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapitalFinancialNeeds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapitalFinancialNeeds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
