import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catalogs } from './catalogs';

describe('Catalogs', () => {
  let component: Catalogs;
  let fixture: ComponentFixture<Catalogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catalogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
