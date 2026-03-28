import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingProposalComponent } from './pending-proposal'; // Nombre actualizado

describe('PendingProposalComponent', () => {
  let component: PendingProposalComponent;
  let fixture: ComponentFixture<PendingProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingProposalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PendingProposalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
