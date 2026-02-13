import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassModalComponent } from './glass-modal';

describe('GlassModalComponent', () => {
  let component: GlassModalComponent;
  let fixture: ComponentFixture<GlassModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlassModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlassModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
