import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerAdminComponent } from './add-career';

describe('CareerAdminComponent', () => {
  let component: CareerAdminComponent;
  let fixture: ComponentFixture<CareerAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
