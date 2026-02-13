import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyAdminComponent } from './add-capability';

describe('FacultyAdminComponent', () => {
  let component: FacultyAdminComponent;
  let fixture: ComponentFixture<FacultyAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultyAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
