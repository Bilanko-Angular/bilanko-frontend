import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueActivity } from './revenue-activity';

describe('RevenueActivity', () => {
  let component: RevenueActivity;
  let fixture: ComponentFixture<RevenueActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
