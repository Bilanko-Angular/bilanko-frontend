import { TestBed } from '@angular/core/testing';

import { OverviewApiService } from './overview-api.service';

describe('OverviewApiService', () => {
  let service: OverviewApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverviewApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
