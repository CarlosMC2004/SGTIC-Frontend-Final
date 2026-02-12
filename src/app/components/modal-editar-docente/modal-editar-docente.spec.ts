import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarDocente } from './modal-editar-docente';

describe('ModalEditarDocente', () => {
  let component: ModalEditarDocente;
  let fixture: ComponentFixture<ModalEditarDocente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarDocente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarDocente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
