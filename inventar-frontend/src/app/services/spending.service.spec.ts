import { TestBed } from '@angular/core/testing';

import { SpendingService } from './spending.service';

describe('SpendingService', () => {
  let service: SpendingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpendingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
