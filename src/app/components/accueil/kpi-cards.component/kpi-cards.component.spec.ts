import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCardsComponent } from './kpi-cards.component';

describe('KpiCardsComponent', () => {
  let component: KpiCardsComponent;
  let fixture: ComponentFixture<KpiCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiCardsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
