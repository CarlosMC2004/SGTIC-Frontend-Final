import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDashboardd } from './student-dashboard';

describe('StudientDashboard', () => {
  let component: StudentDashboardd;
  let fixture: ComponentFixture<StudentDashboardd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDashboardd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
