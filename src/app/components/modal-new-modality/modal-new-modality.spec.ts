import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNewModality } from './modal-new-modality';

describe('ModalNewModality', () => {
  let component: ModalNewModality;
  let fixture: ComponentFixture<ModalNewModality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNewModality]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNewModality);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
