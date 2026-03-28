import { TestBed } from '@angular/core/testing';

import { FacultyDashboardAdmin } from './faculty-dashboard-admin';

describe('FacultyDashboardAdmin', () => {
  let service: FacultyDashboardAdmin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacultyDashboardAdmin);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
