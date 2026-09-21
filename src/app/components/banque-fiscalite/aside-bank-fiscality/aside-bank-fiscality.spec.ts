import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideBankFiscality } from './aside-bank-fiscality';

describe('AsideBankFiscality', () => {
  let component: AsideBankFiscality;
  let fixture: ComponentFixture<AsideBankFiscality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideBankFiscality]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideBankFiscality);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
