import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionChart } from './evolution-chart';

describe('EvolutionChart', () => {
  let component: EvolutionChart;
  let fixture: ComponentFixture<EvolutionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolutionChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
