import { TestBed } from '@angular/core/testing';

import { ManageCareer } from './manage-career';

describe('ManageCareer', () => {
  let service: ManageCareer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageCareer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
