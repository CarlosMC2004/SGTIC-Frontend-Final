import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReportTutorship } from './modal-report-tutorship';

describe('ModalReportTutorship', () => {
  let component: ModalReportTutorship;
  let fixture: ComponentFixture<ModalReportTutorship>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalReportTutorship]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalReportTutorship);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
