import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeModal } from './modal-resume';

describe('ModalResume', () => {
  let component: ResumeModal;
  let fixture: ComponentFixture<ResumeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
