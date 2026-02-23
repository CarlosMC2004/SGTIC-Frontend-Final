import { TestBed } from '@angular/core/testing';

import { RequestAccess } from './request-access';

describe('RequestAccess', () => {
  let service: RequestAccess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestAccess);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
