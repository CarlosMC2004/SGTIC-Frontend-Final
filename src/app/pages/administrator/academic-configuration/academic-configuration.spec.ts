import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicConfiguration } from './academic-configuration';

describe('AcademicConfiguration', () => {
  let component: AcademicConfiguration;
  let fixture: ComponentFixture<AcademicConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicConfiguration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicConfiguration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
