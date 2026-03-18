import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuPrincipalAdminComponent } from './main-menu';

describe('MenuPrincipalAdminComponent', () => {
  let component: MenuPrincipalAdminComponent;
  let fixture: ComponentFixture<MenuPrincipalAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPrincipalAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPrincipalAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
