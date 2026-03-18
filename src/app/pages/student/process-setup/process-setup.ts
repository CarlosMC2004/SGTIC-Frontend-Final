import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import {
  ProcessSetupService,
  DegreeOptionDTO,
  TemaDTO,
  SaveTopicSelectionRequestDTO,
  RegisterProposalStudentTopicRequestDTO
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

  modalityOptions: DegreeOptionDTO[] = [];
  selectedModalityId: number | null = null;
  selectedPeriodoId: number | null = null;

  activeTab: 'banco' | 'proponer' = 'banco';
  selectedTopicId: number | null = null;

  proposeForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  bancoTemas: TemaViewModel[] = [];
  filteredTemas: TemaViewModel[] = [];
  searchTerm = '';

  isLoadingOptions = false;
  isLoadingTopics = false;
  isSaving = false;

  ngOnInit(): void {
    this.loadDegreeOptions();
  }

  get canSave(): boolean {
    if (this.isSaving || !this.selectedModalityId) {
      return false;
    }

    if (this.activeTab === 'banco') {
      return !!this.selectedPeriodoId && this.selectedTopicId !== null;
    }

    return this.proposeForm.valid;
  }

  onPeriodoChange(periodoId: number): void {
    this.selectedPeriodoId = periodoId;
  }

  loadDegreeOptions(): void {
    this.isLoadingOptions = true;

    this.processService.getActiveOptions().subscribe({
      next: (data) => {
        this.modalityOptions = data ?? [];

        if (this.modalityOptions.length > 0) {
          this.selectedModalityId = this.modalityOptions[0].idOption;
          this.loadTemas(this.selectedModalityId);
        }

        this.isLoadingOptions = false;
      },
      error: (err) => {
        console.error('Error al cargar opciones', err);
        this.isLoadingOptions = false;
      }
    });
  }

  loadTemas(idOpcion: number): void {
    this.isLoadingTopics = true;
    this.selectedTopicId = null;
    this.bancoTemas = [];
    this.filteredTemas = [];
    this.searchTerm = '';

    this.processService.getTemasDisponibles(idOpcion).subscribe({
      next: (data) => {
        this.bancoTemas = (data ?? []).map((t: TemaDTO) => ({
          id: t.idTema,
          titulo: t.titulo,
          descripcion: t.descripcion,
          profesor: t.profesor || 'Por definir',
          tags: [t.area || 'General', t.duracion || 'Duración no especificada']
        }));

        this.filteredTemas = [...this.bancoTemas];
        this.isLoadingTopics = false;
      },
      error: (err) => {
        console.error('Error al cargar temas', err);
        this.bancoTemas = [];
        this.filteredTemas = [];
        this.isLoadingTopics = false;
      }
    });
  }

  onSearch(value: string): void {
    this.searchTerm = value.trim().toLowerCase();

    if (!this.searchTerm) {
      this.filteredTemas = [...this.bancoTemas];
      return;
    }

    this.filteredTemas = this.bancoTemas.filter((tema) =>
      tema.titulo.toLowerCase().includes(this.searchTerm) ||
      tema.descripcion.toLowerCase().includes(this.searchTerm) ||
      tema.profesor.toLowerCase().includes(this.searchTerm) ||
      tema.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
    );
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

  selectModality(idOption: number): void {
    if (this.selectedModalityId === idOption) {
      return;
    }

    this.selectedModalityId = idOption;
    this.selectedTopicId = null;

    if (this.activeTab === 'banco') {
      this.loadTemas(idOption);
    }
  }

  switchTab(tab: 'banco' | 'proponer'): void {
    this.activeTab = tab;

    if (tab === 'banco' && this.selectedModalityId) {
      this.loadTemas(this.selectedModalityId);
    }
  }

  selectTopic(id: number): void {
    this.selectedTopicId = id;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedFile = null;
      this.selectedFileName = null;
      return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const maxBytes = 10 * 1024 * 1024;

    if (!allowedExtensions.includes(extension)) {
      alert('Solo se permiten archivos PDF, DOC o DOCX.');
      input.value = '';
      this.selectedFile = null;
      this.selectedFileName = null;
      return;
    }

    if (file.size > maxBytes) {
      alert('El archivo supera el tamaño máximo permitido de 10 MB.');
      input.value = '';
      this.selectedFile = null;
      this.selectedFileName = null;
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  cancelar(): void {
    this.selectedTopicId = null;
    this.selectedFile = null;
    this.selectedFileName = null;
    this.activeTab = 'banco';
    this.proposeForm.reset();
  }

  guardar(): void {
    if (!this.selectedModalityId) {
      alert('Debes seleccionar una modalidad de titulación.');
      return;
    }

    if (this.activeTab === 'proponer') {
      this.guardarPropuestaTema();
      return;
    }

    if (!this.selectedPeriodoId) {
      alert('Debes seleccionar un período en la barra superior.');
      return;
    }

    if (!this.selectedTopicId) {
      alert('Debes seleccionar un tema del banco.');
      return;
    }

    const payload: SaveTopicSelectionRequestDTO = {
      idTema: this.selectedTopicId,
      idOpcion: this.selectedModalityId,
      idPeriodo: this.selectedPeriodoId
    };

    this.isSaving = true;

    this.processService.saveTopicSelection(payload).subscribe({
      next: (response) => {
        this.isSaving = false;
        alert(response.message || 'Selección guardada correctamente');
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error al guardar la selección', err);
        alert(this.processService.extractErrorMessage(err));
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

  const idUsuario = this.getCurrentUserId();

  if (!idUsuario) {
    alert('No se pudo identificar al usuario actual. Verifica el idUsuario almacenado en sesión.');
    return;
  }

  const idOpcion = this.selectedModalityId;

  const payload: RegisterProposalStudentTopicRequestDTO = {
    idUsuario,
    idOpcion,
    titulo: this.proposeForm.get('titulo')?.value?.trim() || '',
    descripcion: this.buildProposalDescription(),
    documento: this.selectedFile
  };

  this.isSaving = true;

  this.processService.registerProposalStudentTopic(payload).subscribe({
    next: (response) => {
      this.isSaving = false;
      alert(response.mensaje || 'Propuesta registrada correctamente.');

      this.resetProposalForm();
      this.activeTab = 'banco';

      if (this.selectedModalityId) {
        this.loadTemas(this.selectedModalityId);
      }
    },
    error: (err) => {
      this.isSaving = false;
      console.error('Error al registrar propuesta', err);
      alert(this.processService.extractErrorMessage(err));
    }
  });
}

  private buildProposalDescription(): string {
    return this.proposeForm.get('descripcion')?.value?.trim() || '';
  }

  private resetProposalForm(): void {
    this.proposeForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
  }

  private getCurrentUserId(): number | null {
    const raw = localStorage.getItem('idUsuario');

    if (!raw) {
      return null;
    }

    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }
}