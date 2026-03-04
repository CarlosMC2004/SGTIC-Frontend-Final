import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNewTopic } from './modal-new-topic';

describe('ModalNewTopic', () => {
  let component: ModalNewTopic;
  let fixture: ComponentFixture<ModalNewTopic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNewTopic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNewTopic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
