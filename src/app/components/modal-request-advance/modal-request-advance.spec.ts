import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRequestAdvance } from './modal-request-advance';

describe('ModalRequestAdvance', () => {
  let component: ModalRequestAdvance;
  let fixture: ComponentFixture<ModalRequestAdvance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRequestAdvance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRequestAdvance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
