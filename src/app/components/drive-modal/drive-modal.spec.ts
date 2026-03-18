import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriveModal } from './drive-modal';

describe('DriveModal', () => {
  let component: DriveModal;
  let fixture: ComponentFixture<DriveModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriveModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriveModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
