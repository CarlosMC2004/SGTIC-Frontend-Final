import { TestBed } from '@angular/core/testing';

import { Tutorship } from './tutorship';

describe('Tutorship', () => {
  let service: Tutorship;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tutorship);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
