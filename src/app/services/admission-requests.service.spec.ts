import { TestBed } from '@angular/core/testing';

import { AdmissionRequestsService } from './admission-requests.service';

describe('AdmissionRequestsService', () => {
  let service: AdmissionRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmissionRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
