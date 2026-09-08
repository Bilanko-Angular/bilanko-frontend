import { TestBed } from '@angular/core/testing';

import { VenteStoreService } from './vente-store.service';

describe('VenteStoreService', () => {
  let service: VenteStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenteStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
