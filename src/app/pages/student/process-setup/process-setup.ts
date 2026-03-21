import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import {
  ProcessSetupService,
  DegreeOptionDTO,
  TemaDTO,
  TopicSelectionRequestDTO,
  RegisterProposalStudentTopicRequestDTO,
  TopicSelectionStatusDTO,
  StudentProposalSummaryDTO,
  StudentProposalHistoryItemDTO,
  UpdateStudentProposalRequestDTO,
  TopicSelectionHistoryItem // <-- Asegúrate de importar la interfaz
} from '../../../services/process-setup/process-setup';

interface TemaViewModel {
  id: number;
  titulo: string;
  descripcion: string;
  profesor: string;
  tags: string[];
}

@Component({
  selector: 'app-process-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, Topbar],
  templateUrl: './process-setup.html',
  styleUrls: ['./process-setup.css']
})
export class ProcessSetup implements OnInit {
  private readonly processService = inject(ProcessSetupService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  modalityOptions: DegreeOptionDTO[] = [];
  selectedModalityId: number | null = null;
  selectedPeriodoId: number | null = null;

  activeTab: 'banco' | 'proponer' = 'banco';
  selectedTopicId: number | null = null;
  isSelectingTopicId: number | null = null;

  proposeForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  editProposalForm: FormGroup = this.fb.group({
    idPropuesta: [null, Validators.required],
    idOpcion: [null, Validators.required],
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  editSelectedFile: File | null = null;
  editSelectedFileName: string | null = null;

  bancoTemas: TemaViewModel[] = [];
  filteredTemas: TemaViewModel[] = [];
  searchTerm = '';

  selectionStatus: TopicSelectionStatusDTO | null = null;

  isHistoryModalOpen = false;
  activeHistoryTab: 'propuestas' | 'selecciones' = 'propuestas';

  studentProposals: StudentProposalSummaryDTO[] = [];
  selectedProposal: StudentProposalSummaryDTO | null = null;
  selectedProposalHistory: StudentProposalHistoryItemDTO[] = [];

  topicSelectionHistory: TopicSelectionHistoryItem[] = [];
  isLoadingSelectionsHistory = false;

  isLoadingOptions = false;
  isLoadingTopics = false;
  isLoadingStatus = false;
  isLoadingProposalList = false;
  isLoadingProposalDetail = false;
  isSaving = false;
  isUpdatingProposal = false;
  isEditingProposal = false;

  ngOnInit(): void {}

  get canUseBankTab(): boolean {
    if (!this.selectedPeriodoId) return false;
    if (!this.selectionStatus) return true;
    return this.selectionStatus.puedeSeleccionar || this.selectionStatus.puedeCambiarTema;
  }

  get canUseProposalTab(): boolean {
    if (!this.selectedPeriodoId) return false;
    if (!this.selectionStatus) return true;
    return this.selectionStatus.puedeProponer;
  }

  get canSave(): boolean {
    if (this.isSaving || !this.selectedModalityId || !this.selectedPeriodoId) return false;
    if (this.selectionStatus?.desactivadoPorPlazo) return false;
    if (this.activeTab === 'banco') return false;
    return this.proposeForm.valid && this.canUseProposalTab;
  }

  get canSaveProposalEdit(): boolean {
    return !this.isUpdatingProposal && this.editProposalForm.valid;
  }

  onPeriodoChange(periodoId: number): void {
    if (!periodoId) return;

    this.ngZone.run(() => {
      this.selectedPeriodoId = periodoId;

      this.selectedModalityId = null;
      this.modalityOptions = [];

      this.selectedTopicId = null;
      this.isSelectingTopicId = null;

      this.bancoTemas = [];
      this.filteredTemas = [];
      this.searchTerm = '';

      this.selectionStatus = null;

      this.selectedProposal = null;
      this.selectedProposalHistory = [];
      this.studentProposals = [];

      this.isEditingProposal = false;
      this.editProposalForm.reset();
      this.editSelectedFile = null;
      this.editSelectedFileName = null;

      this.topicSelectionHistory = [];

      this.loadDegreeOptionsByPeriodo();
      this.loadSelectionStatus();
      this.loadStudentProposals();
      this.loadTopicSelectionHistory();

      this.refreshView();
    });
  }

  openHistoryModal(): void {
    this.isHistoryModalOpen = true;
    if (this.studentProposals.length > 0 && !this.selectedProposal) {
      this.selectProposal(this.studentProposals[0]);
    }
    this.refreshView();
  }

  closeHistoryModal(): void {
    this.isHistoryModalOpen = false;
    if (this.isEditingProposal) {
      this.cancelEditProposal();
    }
    this.refreshView();
  }

  switchHistoryTab(tab: 'propuestas' | 'selecciones'): void {
    this.activeHistoryTab = tab;
    if (tab === 'selecciones' && this.topicSelectionHistory.length === 0) {
      this.loadTopicSelectionHistory();
    }
    this.refreshView();
  }

  loadDegreeOptionsByPeriodo(): void {
    if (!this.selectedPeriodoId) return;

    this.isLoadingOptions = true;

    this.processService.getDegreeOptionsByPeriodo(this.selectedPeriodoId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.modalityOptions = data ?? [];
          this.isLoadingOptions = false;

          if (this.modalityOptions.length > 0) {
            this.selectedModalityId = this.modalityOptions[0].idOption;
            this.loadTemas(this.selectedModalityId);
          } else {
            this.selectedModalityId = null;
            this.bancoTemas = [];
            this.filteredTemas = [];
          }

          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoadingOptions = false;
          this.modalityOptions = [];
          this.selectedModalityId = null;
          this.bancoTemas = [];
          this.filteredTemas = [];
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  loadTemas(idOpcion: number): void {
    if (!idOpcion || !this.selectedPeriodoId) return;

    this.isLoadingTopics = true;
    this.selectedTopicId = null;
    this.bancoTemas = [];
    this.filteredTemas = [];
    this.searchTerm = '';

    this.processService.getTemasDisponibles(this.selectedPeriodoId, idOpcion).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.bancoTemas = (data ?? []).map((t: TemaDTO) => ({
            id: t.idTema,
            titulo: t.titulo,
            descripcion: t.descripcion,
            profesor: t.profesor || 'Por definir',
            tags: [t.area || 'General', t.duracion || 'Duración no especificada']
          }));
          this.filteredTemas = [...this.bancoTemas];
          this.isLoadingTopics = false;
          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoadingTopics = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  loadSelectionStatus(): void {
    if (!this.selectedPeriodoId) return;

    this.isLoadingStatus = true;

    this.processService.getTopicSelectionStatus(this.selectedPeriodoId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.selectionStatus = data;
          this.isLoadingStatus = false;
          this.refreshView();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.selectionStatus = null;
          this.isLoadingStatus = false;
          this.refreshView();
        });
      }
    });
  }

  loadStudentProposals(selectProposalId?: number): void {
    if (!this.selectedPeriodoId) return;

    this.isLoadingProposalList = true;

    this.processService.getStudentProposals(this.selectedPeriodoId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.studentProposals = data ?? [];
          this.isLoadingProposalList = false;

          if (this.studentProposals.length > 0) {
            let targetProposal = this.studentProposals[0];

            if (selectProposalId) {
              const found = this.studentProposals.find(p => p.idPropuesta === selectProposalId);
              if (found) {
                targetProposal = found;
              }
            }

            this.selectProposal(targetProposal);
          } else {
            this.selectedProposal = null;
            this.selectedProposalHistory = [];
          }

          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.studentProposals = [];
          this.selectedProposal = null;
          this.selectedProposalHistory = [];
          this.isLoadingProposalList = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  loadProposalHistory(idPropuesta: number): void {
    if (!idPropuesta) return;

    this.isLoadingProposalDetail = true;

    this.processService.getStudentProposalHistory(idPropuesta).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.selectedProposalHistory = data ?? [];
          this.isLoadingProposalDetail = false;
          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.selectedProposalHistory = [];
          this.isLoadingProposalDetail = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  // MÉTODO ACTUALIZADO SIN DATOS QUEMADOS
  loadTopicSelectionHistory(): void {
    if (!this.selectedPeriodoId) return;

    this.isLoadingSelectionsHistory = true;

    this.processService.getTopicSelectionHistory(this.selectedPeriodoId).subscribe({
      next: (data: TopicSelectionHistoryItem[]) => {
        this.ngZone.run(() => {
          this.topicSelectionHistory = data ?? [];
          this.isLoadingSelectionsHistory = false;
          this.refreshView();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.topicSelectionHistory = [];
          this.isLoadingSelectionsHistory = false;
          this.refreshView();
          console.error('Error al cargar historial de selecciones:', err);
        });
      }
    });
  }

  selectProposal(proposal: StudentProposalSummaryDTO): void {
    this.selectedProposal = proposal;
    this.isEditingProposal = false;
    this.editProposalForm.reset();
    this.editSelectedFile = null;
    this.editSelectedFileName = null;
    this.loadProposalHistory(proposal.idPropuesta);
  }

  startEditProposal(proposal: StudentProposalSummaryDTO): void {
    if (!proposal.editable) return;

    this.selectedProposal = proposal;
    this.isEditingProposal = true;
    this.editSelectedFile = null;
    this.editSelectedFileName = null;

    this.editProposalForm.patchValue({
      idPropuesta: proposal.idPropuesta,
      idOpcion: proposal.idOpcion,
      titulo: proposal.titulo,
      descripcion: proposal.descripcion
    });

    this.loadProposalHistory(proposal.idPropuesta);
  }

  cancelEditProposal(): void {
    this.isEditingProposal = false;
    this.editProposalForm.reset();
    this.editSelectedFile = null;
    this.editSelectedFileName = null;
  }

  onSearch(value: string): void {
    this.searchTerm = value.trim().toLowerCase();

    if (!this.searchTerm) {
      this.filteredTemas = [...this.bancoTemas];
    } else {
      this.filteredTemas = this.bancoTemas.filter((tema) =>
        tema.titulo.toLowerCase().includes(this.searchTerm) ||
        tema.descripcion.toLowerCase().includes(this.searchTerm) ||
        tema.profesor.toLowerCase().includes(this.searchTerm) ||
        tema.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
      );
    }

    this.refreshView();
  }

  selectModality(idOption: number): void {
    if (this.selectedModalityId === idOption) return;

    this.ngZone.run(() => {
      this.selectedModalityId = idOption;
      this.selectedTopicId = null;

      if (this.selectedPeriodoId) {
        this.loadTemas(idOption);
      }

      this.refreshView();
    });
  }

  switchTab(tab: 'banco' | 'proponer'): void {
    this.activeTab = tab;

    if (tab === 'banco' && this.selectedModalityId) {
      this.loadTemas(this.selectedModalityId);
    }

    this.refreshView();
  }

  selectTopic(id: number): void {
    if (!this.selectedModalityId || !this.selectedPeriodoId) return;
    if (!this.canUseBankTab) return;

    const previousSelected = this.selectedTopicId;

    const payload: TopicSelectionRequestDTO = {
      idTema: id,
      idOpcion: this.selectedModalityId,
      idPeriodo: this.selectedPeriodoId,
      motivo: this.selectionStatus?.puedeCambiarTema ? 'Cambio de tema' : 'Selección inicial'
    };

    this.selectedTopicId = id;
    this.isSelectingTopicId = id;

    this.processService.saveTopicSelection(payload).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isSelectingTopicId = null;

          if (!response.exito) {
            this.selectedTopicId = previousSelected;
            alert(response.mensaje || 'No se pudo guardar la selección.');
            return;
          }

          alert(response.mensaje || 'Selección guardada correctamente.');
          this.loadSelectionStatus();
          this.loadTopicSelectionHistory();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.selectedTopicId = previousSelected;
          this.isSelectingTopicId = null;
          alert(this.processService.extractErrorMessage(err));
          this.loadSelectionStatus();
        });
      }
    });
  }

  clearProposal(): void {
    this.proposeForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
    this.refreshView();
  }

  submitProposal(): void {
    if (this.proposeForm.invalid || !this.selectedModalityId || !this.selectedPeriodoId || !this.canUseProposalTab) {
      this.proposeForm.markAllAsTouched();
      return;
    }

    const payload: RegisterProposalStudentTopicRequestDTO = {
      idOpcion: this.selectedModalityId,
      idPeriodo: this.selectedPeriodoId,
      titulo: this.proposeForm.get('titulo')?.value?.trim() || '',
      descripcion: this.proposeForm.get('descripcion')?.value?.trim() || '',
      documento: this.selectedFile
    };

    this.isSaving = true;

    this.processService.registerProposalStudentTopic(payload).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isSaving = false;
          alert(response.mensaje || 'Propuesta registrada correctamente.');
          this.clearProposal();
          this.activeTab = 'banco';
          this.loadSelectionStatus();
          this.loadStudentProposals();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isSaving = false;
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  saveProposalEdition(): void {
    if (this.editProposalForm.invalid) {
      this.editProposalForm.markAllAsTouched();
      return;
    }

    const idPropuesta = this.editProposalForm.get('idPropuesta')?.value;
    if (!idPropuesta) return;

    const payload: UpdateStudentProposalRequestDTO = {
      idOpcion: this.editProposalForm.get('idOpcion')?.value,
      titulo: this.editProposalForm.get('titulo')?.value?.trim() || '',
      descripcion: this.editProposalForm.get('descripcion')?.value?.trim() || '',
      documento: this.editSelectedFile
    };

    this.isUpdatingProposal = true;

    this.processService.updateStudentProposal(idPropuesta, payload).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isUpdatingProposal = false;
          alert(response.mensaje || 'Propuesta actualizada correctamente.');
          this.cancelEditProposal();
          this.loadStudentProposals(idPropuesta);
          this.loadSelectionStatus();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isUpdatingProposal = false;
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  openFilePicker(fileInput: HTMLInputElement): void {
    if (this.canUseProposalTab) {
      fileInput.click();
    }
  }

  openEditFilePicker(fileInput: HTMLInputElement): void {
    if (this.isEditingProposal) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const result = this.validateSelectedFile(event);
    this.selectedFile = result.file;
    this.selectedFileName = result.fileName;
  }

  onEditFileSelected(event: Event): void {
    const result = this.validateSelectedFile(event);
    this.editSelectedFile = result.file;
    this.editSelectedFileName = result.fileName;
  }

  private validateSelectedFile(event: Event): { file: File | null; fileName: string | null } {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return { file: null, fileName: null };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      alert('Solo se permiten archivos PDF, DOC o DOCX.');
      input.value = '';
      return { file: null, fileName: null };
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo permitido de 10 MB.');
      input.value = '';
      return { file: null, fileName: null };
    }

    return { file, fileName: file.name };
  }

  getIconForOption(name: string): string {
    const lower = name.toLowerCase();

    if (lower.includes('investigación') || lower.includes('investigacion')) return 'science';
    if (lower.includes('tecnológico') || lower.includes('tecnologico')) return 'memory';
    if (lower.includes('complexivo')) return 'quiz';
    if (lower.includes('emprendimiento')) return 'lightbulb';

    return 'library_books';
  }

  getSelectedModalityName(): string {
    return this.modalityOptions.find(o => o.idOption === this.selectedModalityId)?.name || '';
  }

  getProposalStatusLabel(status: string): string {
    const value = (status || '').toLowerCase();

    if (value === 'pendiente') return 'Pendiente';
    if (value === 'aprobada') return 'Aprobada';
    if (value === 'rechazada') return 'Rechazada';
    if (value === 'correccion') return 'Corrección';

    return status;
  }

  getProposalStatusClass(status: string): string {
    const value = (status || '').toLowerCase();

    if (value === 'aprobada') return 'status-success';
    if (value === 'rechazada') return 'status-danger';
    if (value === 'correccion') return 'status-warning';

    return 'status-neutral-badge';
  }

  private refreshView(): void {
    this.cdr.detectChanges();
  }
}