import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRequests } from './student-requests';

describe('StudentRequests', () => {
  let component: StudentRequests;
  let fixture: ComponentFixture<StudentRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
