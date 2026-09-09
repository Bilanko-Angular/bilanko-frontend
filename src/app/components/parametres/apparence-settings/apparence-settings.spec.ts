import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApparenceSettings } from './apparence-settings';

describe('ApparenceSettings', () => {
  let component: ApparenceSettings;
  let fixture: ComponentFixture<ApparenceSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApparenceSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApparenceSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
