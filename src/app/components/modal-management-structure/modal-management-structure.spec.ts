import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalManagementStructureComponent } from './modal-management-structure';

describe('ModalManagementStructureComponent', () => {
  let component: ModalManagementStructureComponent;
  let fixture: ComponentFixture<ModalManagementStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalManagementStructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalManagementStructureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
