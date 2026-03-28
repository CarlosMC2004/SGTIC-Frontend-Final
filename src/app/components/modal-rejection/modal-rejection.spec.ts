import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRejection } from './modal-rejection';

describe('ModalRejection', () => {
  let component: ModalRejection;
  let fixture: ComponentFixture<ModalRejection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRejection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRejection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
