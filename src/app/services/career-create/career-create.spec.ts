import { TestBed } from '@angular/core/testing';

import { CareerCreate } from './career-create';

describe('CareerCreate', () => {
  let service: CareerCreate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CareerCreate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
