import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNewTheme } from './modal-new-theme';

describe('ModalNewTheme', () => {
  let component: ModalNewTheme;
  let fixture: ComponentFixture<ModalNewTheme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNewTheme]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNewTheme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
