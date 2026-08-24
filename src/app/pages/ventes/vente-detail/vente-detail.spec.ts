import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteDetail } from './vente-detail';

describe('VenteDetail', () => {
  let component: VenteDetail;
  let fixture: ComponentFixture<VenteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
