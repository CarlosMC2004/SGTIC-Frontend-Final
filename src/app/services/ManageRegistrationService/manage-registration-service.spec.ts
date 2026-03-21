import { TestBed } from '@angular/core/testing';

import { ManageRegistrationService } from './manage-registration-service';

describe('ManageRegistrationService', () => {
  let service: ManageRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
