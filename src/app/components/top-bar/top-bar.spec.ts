import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Topbar } from './top-bar';  // 👈 CORREGIDO: importación con llaves {}

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topbar]  // El componente es standalone
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});