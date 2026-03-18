import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessSetup } from './process-setup';

describe('ProcessSetup', () => {
  let component: ProcessSetup;
  let fixture: ComponentFixture<ProcessSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
