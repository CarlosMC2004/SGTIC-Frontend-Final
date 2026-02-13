import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultadesComponent } from './institutional-structure';

describe('FacultadesComponent', () => {
  let component: FacultadesComponent;
  let fixture: ComponentFixture<FacultadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacultadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultadesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
