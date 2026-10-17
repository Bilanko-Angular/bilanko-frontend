import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicSearchBar } from './basic-search-bar';

describe('BasicSearchBar', () => {
  let component: BasicSearchBar;
  let fixture: ComponentFixture<BasicSearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicSearchBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicSearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
