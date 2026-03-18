import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Advances } from './advances';

describe('Advances', () => {
  let component: Advances;
  let fixture: ComponentFixture<Advances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Advances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Advances);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
