import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperDocument } from './stepper-document';

describe('StepperDocument', () => {
  let component: StepperDocument;
  let fixture: ComponentFixture<StepperDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperDocument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperDocument);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
