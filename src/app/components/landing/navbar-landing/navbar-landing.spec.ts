import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarLanding } from './navbar-landing';

describe('NavbarLanding', () => {
  let component: NavbarLanding;
  let fixture: ComponentFixture<NavbarLanding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarLanding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarLanding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
