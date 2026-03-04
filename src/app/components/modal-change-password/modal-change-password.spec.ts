import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordModal } from './modal-change-password';

describe('ModalChangePassword', () => {
  let component: ChangePasswordModal;
  let fixture: ComponentFixture<ChangePasswordModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
