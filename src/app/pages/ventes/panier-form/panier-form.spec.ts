import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierForm } from './panier-form';

describe('PanierForm', () => {
  let component: PanierForm;
  let fixture: ComponentFixture<PanierForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanierForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
