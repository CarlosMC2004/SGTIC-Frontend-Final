import { TestBed } from '@angular/core/testing';

import { StudentDashboard } from './student-dashboard';

describe('StudentDashboard', () => {
  let service: StudentDashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
