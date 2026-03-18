import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingDeliveries } from './upcoming-deliveries';

describe('UpcomingDeliveries', () => {
  let component: UpcomingDeliveries;
  let fixture: ComponentFixture<UpcomingDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingDeliveries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
