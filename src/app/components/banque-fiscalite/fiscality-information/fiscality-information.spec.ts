import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalityInformation } from './fiscality-information';

describe('FiscalityInformation', () => {
  let component: FiscalityInformation;
  let fixture: ComponentFixture<FiscalityInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiscalityInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiscalityInformation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
