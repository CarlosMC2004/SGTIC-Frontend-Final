import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tutorships } from './tutorships';

describe('Tutorships', () => {
  let component: Tutorships;
  let fixture: ComponentFixture<Tutorships>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tutorships]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tutorships);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
