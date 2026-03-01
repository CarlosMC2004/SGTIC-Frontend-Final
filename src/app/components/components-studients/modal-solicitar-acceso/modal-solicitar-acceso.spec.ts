import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSolicitarAcceso } from './modal-solicitar-acceso';

describe('ModalSolicitarAcceso', () => {
  let component: ModalSolicitarAcceso;
  let fixture: ComponentFixture<ModalSolicitarAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSolicitarAcceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSolicitarAcceso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
