import { TestBed } from '@angular/core/testing';

import { BackupAdminService } from './backup-dashboard';

describe('BackupDashboard', () => {
  let service: BackupAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackupAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
