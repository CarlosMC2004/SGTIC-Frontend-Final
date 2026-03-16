import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalScheduleTutorship } from './modal-schedule-tutorship';

describe('ModalScheduleTutorship', () => {
  let component: ModalScheduleTutorship;
  let fixture: ComponentFixture<ModalScheduleTutorship>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalScheduleTutorship]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalScheduleTutorship);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
