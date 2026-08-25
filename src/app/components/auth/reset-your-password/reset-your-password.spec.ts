import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetYourPassword } from './reset-your-password';

describe('ResetYourPassword', () => {
  let component: ResetYourPassword;
  let fixture: ComponentFixture<ResetYourPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetYourPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetYourPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
