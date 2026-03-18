import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DegreeOptions } from './degree-options';

describe('DegreeOptions', () => {
  let component: DegreeOptions;
  let fixture: ComponentFixture<DegreeOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DegreeOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DegreeOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
