import { TestBed } from '@angular/core/testing';

import { IncomingsService } from './incomings.service';

describe('IncomingsService', () => {
  let service: IncomingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
