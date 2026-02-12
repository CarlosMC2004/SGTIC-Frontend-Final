import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesTable } from './solicitudes-table';

describe('SolicitudesTable', () => {
  let component: SolicitudesTable;
  let fixture: ComponentFixture<SolicitudesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
