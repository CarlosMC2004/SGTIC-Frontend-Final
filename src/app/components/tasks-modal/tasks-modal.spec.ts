import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksModal } from './tasks-modal';

describe('TasksModal', () => {
  let component: TasksModal;
  let fixture: ComponentFixture<TasksModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasksModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
