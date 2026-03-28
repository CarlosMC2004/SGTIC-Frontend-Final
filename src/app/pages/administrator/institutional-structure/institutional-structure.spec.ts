import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionalStructureComponent } from './institutional-structure';

describe('InstitutionalStructureComponent', () => {
  let component: InstitutionalStructureComponent;
  let fixture: ComponentFixture<InstitutionalStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstitutionalStructureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionalStructureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
