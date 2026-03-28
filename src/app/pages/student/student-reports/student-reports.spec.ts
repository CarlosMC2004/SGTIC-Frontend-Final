import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentReports } from './student-reports';

describe('StudentReports', () => {
  let component: StudentReports;
  let fixture: ComponentFixture<StudentReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
