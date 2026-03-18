import {Component, inject, OnInit, ChangeDetectorRef, forwardRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { ScheduleTutorshipModalComponent, AssignedWorkOption } from '../../../components/modal-schedule-tutorship/modal-schedule-tutorship';
import { TutorshipService } from '../../../services/tutorship/tutorship';
import { TutorshipRequestDTO,TutorshipResponseDTO, AssignedWorkDTO } from '../../../models/tutorship.model';
import {FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-director-tutorships',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, ScheduleTutorshipModalComponent],
  templateUrl: './tutorships.html',
  styleUrls: ['./tutorships.css']
})
export class TutorshipsComponent implements OnInit {

  private tutorshipService = inject(TutorshipService);
  private cdr = inject(ChangeDetectorRef);

  tutorships: TutorshipResponseDTO[] = [];
  activeTab: 'upcoming' | 'history' = 'upcoming';
  isScheduleModalOpen = false;
  assignedWorksForSelect: AssignedWorkDTO[] = [];

  ngOnInit(): void {
    this.loadTutorships();
    this.loadAssignedWorks();
  }
  loadTutorships() {
    this.tutorshipService.getMyTutorships().subscribe({
      next: (data) => {
        this.tutorships = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las tutorías:', err);
      }
    });
  }
  loadAssignedWorks() {
    this.tutorshipService.getAssignedWorks().subscribe({
      next: (data) => {
        this.assignedWorksForSelect = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los trabajos asignados:', err);
      }
    });
  }
  openScheduleModal() {
    this.isScheduleModalOpen = true;
  }
  closeScheduleModal() {
    this.isScheduleModalOpen = false;
  }
  handleScheduleSave(data: any) {
    this.tutorshipService.scheduleTutorship(data).subscribe({
      next: (response) => {
        alert('Reunión agendada exitosamente en el sistema.');
        this.closeScheduleModal();
        this.loadTutorships();
      },
      error: (err) => {
        console.error('Error al agendar la reunión:', err);
        const errorMsg = err.error?.error || 'Ocurrió un error al agendar la reunión.';
        alert(errorMsg);
      }
    });
  }
  setTab(tab: 'upcoming' | 'history') {
    this.activeTab = tab;
  }

  get filteredTutorships() {
    if (this.activeTab === 'upcoming') {
      return this.tutorships.filter(t => t.status === 'pending' || t.status === 'proposed');
    } else {
      return this.tutorships.filter(t => t.status === 'completed');
    }
  }

  openReportModal(tutorshipId: number) {
    alert(`Abrir modal para subir informe de la tutoría #${tutorshipId}`);
  }

  acceptProposal(tutorshipId: number) {
    alert(`Tutoría #${tutorshipId} aceptada y agendada.`);
  }
}
