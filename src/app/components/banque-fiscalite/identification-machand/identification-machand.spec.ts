import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationMachand } from './identification-machand';

describe('IdentificationMachand', () => {
  let component: IdentificationMachand;
  let fixture: ComponentFixture<IdentificationMachand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentificationMachand]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentificationMachand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
