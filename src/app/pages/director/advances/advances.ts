import {Component, inject, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { RequestAdvanceModalComponent } from '../../../components/modal-request-advance/modal-request-advance';
import { TutorshipService } from '../../../services/tutorship/tutorship';
import { AssignedWorkDTO } from '../../../models/tutorship.model';

export interface AdvanceDocument {
  idDocument: number;
  fileName: string;
  category: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
}

@Component({
  selector: 'app-director-advances',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, RequestAdvanceModalComponent],
  templateUrl: './advances.html',
  styleUrls: ['./advances.css']
})
export class AdvancesComponent implements OnInit {

  private tutorshipService = inject(TutorshipService);
  private cdr = inject(ChangeDetectorRef);

  assignedStudents: AssignedWorkDTO[] = [];
  studentDocuments: AdvanceDocument[] = [];
  selectedStudent: AssignedWorkDTO | null = null;
  isLoadingDocs = false;
  isRequestModalOpen = false;

  private mockDocumentsDB: Record<number, AdvanceDocument[]> = {
    1: [
      { idDocument: 101, fileName: 'Capítulo_I_Introducción_Final.pdf', category: 'Capítulo I', uploadDate: '2026-03-10', status: 'approved', feedback: 'Buen planteamiento del problema, objetivos claros.' },
      { idDocument: 102, fileName: 'Capitulo_II_Marco_Teorico_v2.docx', category: 'Capítulo II', uploadDate: '2026-03-14', status: 'pending', feedback: null }
    ],
    2: [
      { idDocument: 201, fileName: 'Propuesta_Aprobada_Firmada.pdf', category: 'Propuesta', uploadDate: '2026-02-28', status: 'approved', feedback: 'Documento base validado.' },
      { idDocument: 202, fileName: 'Diagramas_Arquitectura_IA.pdf', category: 'Anexos', uploadDate: '2026-03-12', status: 'rejected', feedback: 'Los diagramas de secuencia están incompletos y falta especificar el modelo de NLP.' },
      { idDocument: 203, fileName: 'Capitulo_III_Metodologia.pdf', category: 'Capítulo III', uploadDate: '2026-03-15', status: 'pending', feedback: null }
    ],
    3: []
  };

  ngOnInit(): void {
    this.loadAssignedStudents();
  }

  loadAssignedStudents() {
    this.tutorshipService.getAssignedWorks().subscribe({
      next: (data: AssignedWorkDTO[]) => {
        this.assignedStudents = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los tesistas asignados:', err);
      }
    });
  }

  selectStudent(student: AssignedWorkDTO) {
    this.selectedStudent = student;
    this.loadStudentDocuments(student.idWork);
  }

  loadStudentDocuments(idWork: number) {
    this.isLoadingDocs = true;
    this.studentDocuments = [];

    setTimeout(() => {
      this.studentDocuments = this.mockDocumentsDB[idWork] || [];
      this.isLoadingDocs = false;
    }, 400);
  }

  downloadDocument(idDocument: number) {
    alert(`Simulando descarga del documento #${idDocument}...`);
  }

  openReviewModal(doc: AdvanceDocument) {
    if (doc.status === 'approved') {
      alert(`Este documento ya fue Aprobado.\nFeedback anterior: ${doc.feedback}`);
    } else if (doc.status === 'rejected') {
      alert(`Este documento fue Rechazado.\nFeedback anterior: ${doc.feedback}`);
    } else {
      alert(`Abriendo modal para calificar: ${doc.fileName}`);
    }
  }
  requestAdvance(student: AssignedWorkDTO) {
    this.isRequestModalOpen = true;
  }

  closeRequestModal() {
    this.isRequestModalOpen = false;
  }

  handleSendRequest(data: any) {
    console.log('Datos listos para enviar a historial_version_propuesta_estudiante:', data);

    alert('Solicitud enviada exitosamente al estudiante.');
    this.closeRequestModal();
  }
}
