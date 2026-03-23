import {Component, inject, OnInit, ChangeDetectorRef, forwardRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { ScheduleTutorshipModalComponent, AssignedWorkOption } from '../../../components/modal-schedule-tutorship/modal-schedule-tutorship';
import { TutorshipService } from '../../../services/tutorship/tutorship';
import { TutorshipReportDTO,TutorshipResponseDTO, AssignedWorkDTO } from '../../../models/tutorship.model';
import { Topbar } from '../../../components/top-bar/top-bar';
import { ModalReportTutorship } from '../../../components/modal-report-tutorship/modal-report-tutorship';


@Component({
  selector: 'app-director-tutorships',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ScheduleTutorshipModalComponent, Topbar, ModalReportTutorship],
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
  isReportModalOpen = false;
  isScheduling = false;
  selectedTutoringId!: number;

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
  openReportModal(id: number) {
    console.log('Abriendo modal para la tutoría:', id);
    this.selectedTutoringId = id;
    this.isReportModalOpen = true;
  }

  handleReportSaved() {
    this.isReportModalOpen = false;
    this.loadTutorships();
  }

  downloadReport(id: number) {
    this.tutorshipService.downloadReport(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe_tutoria_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el informe:', err);
        alert('No se pudo descargar el archivo. Es posible que el archivo no exista en el servidor.');
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
    this.isScheduling = true;
    this.tutorshipService.scheduleTutorship(data).subscribe({
      next: (response) => {
        this.isScheduling = false;
        this.closeScheduleModal();
        this.loadTutorships();
      },
      error: (err) => {
        this.isScheduling = false;
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
  acceptProposal(tutorshipId: number) {
    alert(`Tutoría #${tutorshipId} aceptada y agendada.`);
  }
}
