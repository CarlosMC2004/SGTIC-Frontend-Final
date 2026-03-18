import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import {
  ProcessSetupService,
  DegreeOptionDTO,
  TemaDTO,
  SaveTopicSelectionRequestDTO,
  RegisterProposalStudentTopicRequestDTO,
  TopicSelectionStatusDTO,
  StudentProposalSummaryDTO,
  StudentProposalHistoryItemDTO,
  UpdateStudentProposalRequestDTO
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

  studentProposals: StudentProposalSummaryDTO[] = [];
  selectedProposal: StudentProposalSummaryDTO | null = null;
  selectedProposalHistory: StudentProposalHistoryItemDTO[] = [];

  isLoadingOptions = false;
  isLoadingTopics = false;
  isLoadingStatus = false;
  isLoadingProposalList = false;
  isLoadingProposalDetail = false;
  isSaving = false;
  isUpdatingProposal = false;
  isEditingProposal = false;

  ngOnInit(): void {
    this.loadDegreeOptions();
  }

  get canUseBankTab(): boolean {
    if (!this.selectedPeriodoId) {
      return false;
    }

    if (!this.selectionStatus) {
      return true;
    }

    return this.selectionStatus.puedeSeleccionar || this.selectionStatus.puedeCambiarTema;
  }

  get canUseProposalTab(): boolean {
    if (!this.selectedPeriodoId) {
      return false;
    }

    if (!this.selectionStatus) {
      return true;
    }

    return this.selectionStatus.puedeProponer;
  }

  get canSave(): boolean {
    if (this.isSaving || !this.selectedModalityId || !this.selectedPeriodoId) {
      return false;
    }

    if (this.selectionStatus?.desactivadoPorPlazo) {
      return false;
    }

    if (this.activeTab === 'banco') {
      return false;
    }

    return this.proposeForm.valid && this.canUseProposalTab;
  }

  get canSaveProposalEdit(): boolean {
    return !this.isUpdatingProposal && this.editProposalForm.valid;
  }

  onPeriodoChange(periodoId: number): void {
    if (!periodoId) {
      return;
    }

    this.ngZone.run(() => {
      this.selectedPeriodoId = periodoId;
      this.selectedTopicId = null;
      this.isSelectingTopicId = null;
      this.selectedProposal = null;
      this.selectedProposalHistory = [];
      this.isEditingProposal = false;
      this.editProposalForm.reset();
      this.editSelectedFile = null;
      this.editSelectedFileName = null;

      this.loadSelectionStatus();
      this.loadStudentProposals();

      if (this.selectedModalityId) {
        this.loadTemas(this.selectedModalityId);
      }

      this.refreshView();
    });
  }

  loadDegreeOptions(): void {
    this.isLoadingOptions = true;
    this.refreshView();

    this.processService.getActiveOptions().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.modalityOptions = data ?? [];

          if (this.modalityOptions.length > 0) {
            this.selectedModalityId = this.modalityOptions[0].idOption;
            this.loadTemas(this.selectedModalityId);
          } else {
            this.selectedModalityId = null;
            this.bancoTemas = [];
            this.filteredTemas = [];
          }

          this.isLoadingOptions = false;
          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoadingOptions = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  loadTemas(idOpcion: number): void {
    if (!idOpcion) {
      this.bancoTemas = [];
      this.filteredTemas = [];
      this.refreshView();
      return;
    }

    this.isLoadingTopics = true;
    this.selectedTopicId = null;
    this.isSelectingTopicId = null;
    this.bancoTemas = [];
    this.filteredTemas = [];
    this.searchTerm = '';
    this.refreshView();

    this.processService.getTemasDisponibles(idOpcion).subscribe({
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
          this.bancoTemas = [];
          this.filteredTemas = [];
          this.isLoadingTopics = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  loadSelectionStatus(): void {
    if (!this.selectedPeriodoId) {
      this.selectionStatus = null;
      this.refreshView();
      return;
    }

    this.isLoadingStatus = true;
    this.refreshView();

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
    if (!this.selectedPeriodoId) {
      this.studentProposals = [];
      this.selectedProposal = null;
      this.selectedProposalHistory = [];
      this.refreshView();
      return;
    }

    this.isLoadingProposalList = true;
    this.refreshView();

    this.processService.getStudentProposals(this.selectedPeriodoId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.studentProposals = data ?? [];
          this.isLoadingProposalList = false;

          if (this.studentProposals.length === 0) {
            this.selectedProposal = null;
            this.selectedProposalHistory = [];
            this.refreshView();
            return;
          }

          if (selectProposalId) {
            const found = this.studentProposals.find(p => p.idPropuesta === selectProposalId);

            if (found) {
              this.selectProposal(found);
              this.refreshView();
              return;
            }
          }

          const sameSelected = this.selectedProposal
            ? this.studentProposals.find(p => p.idPropuesta === this.selectedProposal?.idPropuesta)
            : null;

          if (sameSelected) {
            this.selectProposal(sameSelected);
          } else {
            this.selectProposal(this.studentProposals[0]);
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
    if (!idPropuesta) {
      this.selectedProposalHistory = [];
      this.refreshView();
      return;
    }

    this.isLoadingProposalDetail = true;
    this.refreshView();

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

  selectProposal(proposal: StudentProposalSummaryDTO): void {
    this.selectedProposal = proposal;
    this.isEditingProposal = false;
    this.editProposalForm.reset();
    this.editSelectedFile = null;
    this.editSelectedFileName = null;
    this.loadProposalHistory(proposal.idPropuesta);
    this.refreshView();
  }

  startEditProposal(proposal: StudentProposalSummaryDTO): void {
    if (!proposal.editable) {
      alert('Solo se puede modificar una propuesta pendiente.');
      return;
    }

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
    this.refreshView();
  }

  cancelEditProposal(): void {
    this.isEditingProposal = false;
    this.editProposalForm.reset();
    this.editSelectedFile = null;
    this.editSelectedFileName = null;
    this.refreshView();
  }

  onSearch(value: string): void {
    this.searchTerm = value.trim().toLowerCase();

    if (!this.searchTerm) {
      this.filteredTemas = [...this.bancoTemas];
      this.refreshView();
      return;
    }

    this.filteredTemas = this.bancoTemas.filter((tema) =>
      tema.titulo.toLowerCase().includes(this.searchTerm) ||
      tema.descripcion.toLowerCase().includes(this.searchTerm) ||
      tema.profesor.toLowerCase().includes(this.searchTerm) ||
      tema.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
    );

    this.refreshView();
  }

  getIconForOption(name: string): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('investigación') || nameLower.includes('investigacion')) {
      return 'science';
    }

    if (nameLower.includes('tecnológico') || nameLower.includes('tecnologico')) {
      return 'memory';
    }

    if (nameLower.includes('complexivo')) {
      return 'quiz';
    }

    if (nameLower.includes('emprendimiento')) {
      return 'lightbulb';
    }

    return 'library_books';
  }

  getSelectedModalityName(): string {
    if (!this.selectedModalityId) {
      return '';
    }

    const selected = this.modalityOptions.find(
      option => option.idOption === this.selectedModalityId
    );

    return selected?.name || '';
  }

  getSaveButtonLabel(): string {
    return 'Enviar Propuesta';
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

  selectModality(idOption: number): void {
    if (this.selectedModalityId === idOption) {
      return;
    }

    this.ngZone.run(() => {
      this.selectedModalityId = idOption;
      this.selectedTopicId = null;
      this.isSelectingTopicId = null;

      this.loadTemas(idOption);
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
    if (!this.selectedModalityId) {
      alert('Debes seleccionar una modalidad de titulación.');
      return;
    }

    if (!this.selectedPeriodoId) {
      alert('Debes seleccionar un período en la barra superior.');
      return;
    }

    if (!this.canUseBankTab) {
      alert(this.selectionStatus?.mensaje || 'No puedes seleccionar o cambiar tema en este momento.');
      return;
    }

    const payload: SaveTopicSelectionRequestDTO = {
      idTema: id,
      idOpcion: this.selectedModalityId,
      idPeriodo: this.selectedPeriodoId
    };

    this.selectedTopicId = id;
    this.isSelectingTopicId = id;
    this.refreshView();

    this.processService.saveTopicSelection(payload).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isSelectingTopicId = null;
          this.selectedTopicId = id;

          alert(response.message || 'Selección guardada correctamente');

          this.loadSelectionStatus();
          this.loadStudentProposals();
          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isSelectingTopicId = null;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
          this.loadSelectionStatus();
        });
      }
    });
  }

  openFilePicker(fileInput: HTMLInputElement): void {
    if (!this.canUseProposalTab) {
      alert(this.selectionStatus?.mensaje || 'No puedes registrar una propuesta en este momento.');
      return;
    }

    fileInput.click();
  }

  openEditFilePicker(fileInput: HTMLInputElement): void {
    if (!this.isEditingProposal) {
      return;
    }

    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const result = this.validateSelectedFile(event);
    this.selectedFile = result.file;
    this.selectedFileName = result.fileName;
    this.refreshView();
  }

  onEditFileSelected(event: Event): void {
    const result = this.validateSelectedFile(event);
    this.editSelectedFile = result.file;
    this.editSelectedFileName = result.fileName;
    this.refreshView();
  }

  cancelar(): void {
    this.selectedTopicId = null;
    this.isSelectingTopicId = null;
    this.selectedFile = null;
    this.selectedFileName = null;
    this.activeTab = 'banco';
    this.proposeForm.reset();
    this.refreshView();
  }

  guardar(): void {
    if (!this.selectedModalityId) {
      alert('Debes seleccionar una modalidad de titulación.');
      return;
    }

    if (!this.selectedPeriodoId) {
      alert('Debes seleccionar un período en la barra superior.');
      return;
    }

    if (this.selectionStatus?.desactivadoPorPlazo) {
      alert(this.selectionStatus.mensaje);
      return;
    }

    if (this.activeTab === 'proponer') {
      this.guardarPropuestaTema();
      return;
    }

    alert('Para temas del banco usa el botón "Seleccionar" de cada tema.');
  }

  saveProposalEdition(): void {
    if (this.editProposalForm.invalid) {
      this.editProposalForm.markAllAsTouched();
      alert('Completa los campos obligatorios de la actualización.');
      return;
    }

    const idPropuesta = this.editProposalForm.get('idPropuesta')?.value;
    if (!idPropuesta) {
      alert('No se encontró la propuesta a actualizar.');
      return;
    }

    const payload: UpdateStudentProposalRequestDTO = {
      idOpcion: this.editProposalForm.get('idOpcion')?.value,
      titulo: this.editProposalForm.get('titulo')?.value?.trim() || '',
      descripcion: this.editProposalForm.get('descripcion')?.value?.trim() || '',
      documento: this.editSelectedFile
    };

    this.isUpdatingProposal = true;
    this.refreshView();

    this.processService.updateStudentProposal(idPropuesta, payload).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isUpdatingProposal = false;
          alert(response.mensaje || 'Propuesta actualizada correctamente.');
          this.cancelEditProposal();
          this.loadStudentProposals(idPropuesta);
          this.loadSelectionStatus();
          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isUpdatingProposal = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
        });
      }
    });
  }

  private guardarPropuestaTema(): void {
    if (this.proposeForm.invalid) {
      this.proposeForm.markAllAsTouched();
      alert('Completa los campos obligatorios de la propuesta.');
      return;
    }

    if (!this.selectedModalityId) {
      alert('Debes seleccionar una modalidad de titulación.');
      return;
    }

    if (!this.selectedPeriodoId) {
      alert('Debes seleccionar un período en la barra superior.');
      return;
    }

    if (!this.canUseProposalTab) {
      alert(this.selectionStatus?.mensaje || 'No puedes registrar una propuesta en este momento.');
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
    this.refreshView();

    this.processService.registerProposalStudentTopic(payload).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.isSaving = false;
          alert(response.mensaje || 'Propuesta registrada correctamente.');

          this.resetProposalForm();
          
          // OPACIONAL: Enviar de vuelta al dashboard para que vea el stepper actualizado
          // this.router.navigate(['/dashboard']); 
          
          this.activeTab = 'banco';
          this.loadSelectionStatus();
          this.loadStudentProposals();

          if (this.selectedModalityId) {
            this.loadTemas(this.selectedModalityId);
          }

          this.refreshView();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.refreshView();
          alert(this.processService.extractErrorMessage(err));
          this.loadSelectionStatus();
        });
      }
    });
  }

  private resetProposalForm(): void {
    this.proposeForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
    this.refreshView();
  }

  private validateSelectedFile(event: Event): { file: File | null; fileName: string | null } {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return { file: null, fileName: null };
    }

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const maxBytes = 10 * 1024 * 1024;

    if (!allowedExtensions.includes(extension)) {
      alert('Solo se permiten archivos PDF, DOC o DOCX.');
      input.value = '';
      return { file: null, fileName: null };
    }

    if (file.size > maxBytes) {
      alert('El archivo supera el tamaño máximo permitido de 10 MB.');
      input.value = '';
      return { file: null, fileName: null };
    }

    return { file, fileName: file.name };
  }

  private refreshView(): void {
    this.cdr.detectChanges();
  }
}