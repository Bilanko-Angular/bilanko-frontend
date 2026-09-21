import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBank } from './hero-bank';

describe('HeroBank', () => {
  let component: HeroBank;
  let fixture: ComponentFixture<HeroBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroBank);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
