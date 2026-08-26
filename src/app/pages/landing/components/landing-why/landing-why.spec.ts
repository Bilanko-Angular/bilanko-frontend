import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingWhy } from './landing-why';

describe('LandingWhy', () => {
  let component: LandingWhy;
  let fixture: ComponentFixture<LandingWhy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingWhy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingWhy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
