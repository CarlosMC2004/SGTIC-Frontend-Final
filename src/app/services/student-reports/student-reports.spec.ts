import { TestBed } from '@angular/core/testing';

import { StudentReports } from './student-reports';

describe('StudentReports', () => {
  let service: StudentReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentReports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
