import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionFacultadesCarreras } from './gestion-facultades-carreras';

describe('GestionFacultadesCarreras', () => {
  let component: GestionFacultadesCarreras;
  let fixture: ComponentFixture<GestionFacultadesCarreras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionFacultadesCarreras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionFacultadesCarreras);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
