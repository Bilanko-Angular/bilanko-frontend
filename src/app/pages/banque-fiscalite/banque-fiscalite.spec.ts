import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanqueFiscalite } from './banque-fiscalite';

describe('BanqueFiscalite', () => {
  let component: BanqueFiscalite;
  let fixture: ComponentFixture<BanqueFiscalite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanqueFiscalite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanqueFiscalite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
