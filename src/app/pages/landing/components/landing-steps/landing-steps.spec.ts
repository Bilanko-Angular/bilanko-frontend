import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingSteps } from './landing-steps';

describe('LandingSteps', () => {
  let component: LandingSteps;
  let fixture: ComponentFixture<LandingSteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingSteps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingSteps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
