import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingMeetings } from './pending-meetings';

describe('PendingMeetings', () => {
  let component: PendingMeetings;
  let fixture: ComponentFixture<PendingMeetings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingMeetings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingMeetings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
