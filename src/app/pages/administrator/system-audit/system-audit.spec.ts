import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAudit } from './system-audit';

describe('SystemAudit', () => {
  let component: SystemAudit;
  let fixture: ComponentFixture<SystemAudit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAudit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAudit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
