import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTypeDocument } from './select-type-document';

describe('SelectTypeDocument', () => {
  let component: SelectTypeDocument;
  let fixture: ComponentFixture<SelectTypeDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectTypeDocument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTypeDocument);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
