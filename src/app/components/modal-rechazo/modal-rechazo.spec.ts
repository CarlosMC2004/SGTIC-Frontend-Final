import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRechazo } from './modal-rechazo';

describe('ModalRechazo', () => {
  let component: ModalRechazo;
  let fixture: ComponentFixture<ModalRechazo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRechazo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRechazo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
