import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddArea } from './modal-add-area';

describe('ModalAddArea', () => {
  let component: ModalAddArea;
  let fixture: ComponentFixture<ModalAddArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAddArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAddArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
