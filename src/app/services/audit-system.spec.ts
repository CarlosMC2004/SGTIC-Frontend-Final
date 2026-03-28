import { TestBed } from '@angular/core/testing';

import { AuditSystem } from './audit-system';

describe('AuditSystem', () => {
  let service: AuditSystem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditSystem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
