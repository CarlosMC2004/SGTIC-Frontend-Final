import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FacultadSimple {
  id_facultad?: number;
  nombre: string;
  siglas: string;
}

export interface CarreraSimple {
  id_carrera?: number;
  id_facultad: number | null;
  nombre: string;
}

@Component({
  selector: 'app-modal-management-structure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-management-structure.html',
  styleUrls: ['./modal-management-structure.css']
})
export class ModalManagementStructureComponent implements OnChanges {

  @Input() initialTab: 'facultad' | 'carrera' = 'facultad';
  @Input() preselectedFacultyId: number | null = null;
  @Input() facultadesList: FacultadSimple[] = [];

  @Input() editData: any = null;
  @Input() isEditMode: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() saveFacultad = new EventEmitter<FacultadSimple>();
  @Output() saveCarrera = new EventEmitter<CarreraSimple>();

  // --- ESTADO INTERNO ---
  activeTab: 'facultad' | 'carrera' = 'facultad';
  
  facultadData: FacultadSimple = { nombre: '', siglas: '' };
  carreraData: CarreraSimple = { id_facultad: null, nombre: '' };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialTab']) {
      this.activeTab = this.initialTab;
    }

    if(changes['editData'] && this.editData) {
      this.populateFormForEdit();
    }
    else if (changes['preselectedFacultyId'] && this.preselectedFacultyId && !this.isEditMode) {
      this.carreraData.id_facultad = this.preselectedFacultyId;
    }
  }

    private populateFormForEdit() {
      if (this.activeTab === 'facultad') {
        this.facultadData = { ...this.editData };
      } else if (this.activeTab === 'carrera') {
        this.carreraData = { ...this.editData }
      }
    }

  onClose() {
    this.resetForms();
    this.close.emit();
  }

  onSaveFacultad() {
    if (this.facultadData.nombre.trim() && this.facultadData.siglas.trim()) {
      this.facultadData.siglas = this.facultadData.siglas.toUpperCase();
      this.saveFacultad.emit(this.facultadData);
    }
  }

  onSaveCarrera() {
    if (this.carreraData.nombre.trim() && this.carreraData.id_facultad) {
      this.saveCarrera.emit(this.carreraData);
    }
  }

  private resetForms() {
    this.facultadData = { nombre: '', siglas: '' };
    this.carreraData = { id_facultad: null, nombre: '' };
  }
}