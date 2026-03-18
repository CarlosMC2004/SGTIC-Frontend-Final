import { TestBed } from '@angular/core/testing';

import { FacultyCreate } from './faculty-create';

describe('FacultyCreate', () => {
  let service: FacultyCreate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacultyCreate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
