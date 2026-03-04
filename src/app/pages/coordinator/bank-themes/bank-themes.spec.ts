import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankThemes } from './bank-themes';

describe('BankThemes', () => {
  let component: BankThemes;
  let fixture: ComponentFixture<BankThemes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankThemes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankThemes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
