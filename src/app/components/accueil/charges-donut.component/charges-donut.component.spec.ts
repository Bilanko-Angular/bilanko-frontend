import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesDonutComponent } from './charges-donut.component';

describe('ChargesDonutComponent', () => {
  let component: ChargesDonutComponent;
  let fixture: ComponentFixture<ChargesDonutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesDonutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargesDonutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
