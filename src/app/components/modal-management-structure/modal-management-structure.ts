import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 1. CORRECCIÓN DEL ERROR: Definimos la interfaz con 'siglas'
export interface FacultadSimple {
  id_facultad?: number;
  nombre: string;
  siglas: string; // <--- Esto soluciona tu error de compilación
}

export interface CarreraSimple {
  id_facultad: number | null;
  nombre: string;
}

@Component({
  selector: 'app-modal-management-structure', // Selector actualizado según tu carpeta
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-management-structure.html',
  styleUrls: ['./modal-management-structure.css']
})
export class ModalManagementStructureComponent implements OnChanges {

  // --- INPUTS (Datos que vienen del padre) ---
  @Input() initialTab: 'facultad' | 'carrera' = 'facultad';
  @Input() preselectedFacultyId: number | null = null;
  @Input() facultadesList: FacultadSimple[] = []; // Lista para el select

  // --- OUTPUTS (Eventos hacia el padre) ---
  @Output() close = new EventEmitter<void>();
  @Output() saveFacultad = new EventEmitter<FacultadSimple>();
  @Output() saveCarrera = new EventEmitter<CarreraSimple>();

  // --- ESTADO INTERNO ---
  activeTab: 'facultad' | 'carrera' = 'facultad';
  
  facultadData: FacultadSimple = { nombre: '', siglas: '' };
  carreraData: CarreraSimple = { id_facultad: null, nombre: '' };

  // Detectamos cambios para configurar el modal al abrirse
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialTab']) {
      this.activeTab = this.initialTab;
    }
    // Si nos pasan un ID de facultad, lo preseleccionamos en el formulario de carrera
    if (changes['preselectedFacultyId'] && this.preselectedFacultyId) {
      this.carreraData.id_facultad = this.preselectedFacultyId;
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
      this.resetForms();
    }
  }

  onSaveCarrera() {
    if (this.carreraData.nombre.trim() && this.carreraData.id_facultad) {
      this.saveCarrera.emit(this.carreraData);
      this.resetForms();
    }
  }

  private resetForms() {
    this.facultadData = { nombre: '', siglas: '' };
    this.carreraData = { id_facultad: null, nombre: '' };
  }
}