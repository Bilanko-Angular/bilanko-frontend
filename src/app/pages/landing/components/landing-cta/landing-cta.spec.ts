import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingCta } from './landing-cta';

describe('LandingCta', () => {
  let component: LandingCta;
  let fixture: ComponentFixture<LandingCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingCta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
