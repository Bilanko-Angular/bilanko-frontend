import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputOtpFormComponent } from './input-otp-form.component';

describe('InputOtpFormComponent', () => {
  let component: InputOtpFormComponent;
  let fixture: ComponentFixture<InputOtpFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputOtpFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputOtpFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
