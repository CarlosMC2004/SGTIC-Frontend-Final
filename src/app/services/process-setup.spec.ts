import { TestBed } from '@angular/core/testing';

import { ProcessSetup } from './process-setup';

describe('ProcessSetup', () => {
  let service: ProcessSetup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessSetup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
