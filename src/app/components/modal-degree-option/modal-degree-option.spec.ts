import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDegreeOption } from './modal-degree-option';

describe('ModalDegreeOption', () => {
  let component: ModalDegreeOption;
  let fixture: ComponentFixture<ModalDegreeOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDegreeOption]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDegreeOption);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
