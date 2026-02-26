import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditTeacher } from './modal-edit-teacher';

describe('ModalEditTeacher', () => {
  let component: ModalEditTeacher;
  let fixture: ComponentFixture<ModalEditTeacher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditTeacher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditTeacher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
