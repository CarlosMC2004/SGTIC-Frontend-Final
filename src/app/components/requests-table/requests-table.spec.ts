import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsTable } from './requests-table';

describe('RequestsTable', () => {
  let component: RequestsTable;
  let fixture: ComponentFixture<RequestsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
