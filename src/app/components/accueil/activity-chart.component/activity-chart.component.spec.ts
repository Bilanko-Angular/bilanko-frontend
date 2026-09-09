import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityChartComponent } from './activity-chart.component';

describe('ActivityChartComponent', () => {
  let component: ActivityChartComponent;
  let fixture: ComponentFixture<ActivityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
