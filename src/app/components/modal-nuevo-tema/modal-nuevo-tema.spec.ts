import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNuevoTema } from './modal-nuevo-tema';

describe('ModalNuevoTema', () => {
  let component: ModalNuevoTema;
  let fixture: ComponentFixture<ModalNuevoTema>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNuevoTema]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNuevoTema);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
