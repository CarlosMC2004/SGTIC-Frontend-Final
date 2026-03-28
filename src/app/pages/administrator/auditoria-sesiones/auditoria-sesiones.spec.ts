import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaSesiones } from './auditoria-sesiones';

describe('AuditoriaSesiones', () => {
  let component: AuditoriaSesiones;
  let fixture: ComponentFixture<AuditoriaSesiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditoriaSesiones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriaSesiones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
