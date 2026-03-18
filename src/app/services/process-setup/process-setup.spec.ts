import { TestBed } from '@angular/core/testing';

import { ProcessSetupService } from './process-setup';

describe('ProcessSetupService', () => {
  let service: ProcessSetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessSetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
