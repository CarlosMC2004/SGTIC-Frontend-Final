import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorshipService } from '../../services/tutorship/tutorship';
import { TutorshipReportDTO } from '../../models/tutorship.model';

@Component({
  selector: 'app-modal-report-tutorship',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-report-tutorship.html',
  styleUrl: './modal-report-tutorship.css',
})
export class ModalReportTutorship {
  @Input() idTutoring!: number;
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  loading = false;
  errorMessage = '';
  selectedFile: File | null = null;

  reportData: TutorshipReportDTO = {
    attendance: true,
    observations: ''
  };

  constructor(private tutorshipService: TutorshipService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Por favor, selecciona un archivo PDF válido.';
      this.selectedFile = null;
    }
  }

  onSave() {
    if (!this.selectedFile) {
      this.errorMessage = 'Debe adjuntar el informe en formato PDF.';
      return;
    }

    if (!this.reportData.observations || this.reportData.observations.length < 10) {
      this.errorMessage = 'Por favor, ingrese observaciones más detalladas.';
      return;
    }

    this.loading = true;
    this.tutorshipService.registerTutorshipReport(this.idTutoring, this.reportData, this.selectedFile)
      .subscribe({
        next: () => {
          this.loading = false;
          this.save.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Error al subir el informe.';
        }
      });
  }
}
