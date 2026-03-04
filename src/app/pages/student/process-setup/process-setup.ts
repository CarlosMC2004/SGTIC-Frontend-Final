import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';

import { ProcessSetupService } from '../../../services/process-setup/process-setup';

// Nota: Si ya tienes esta interfaz en otro archivo, simplemente impórtala y borra esto.
export interface DegreeOptionDTO {
  idOption: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-process-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, Topbar], 
  templateUrl: './process-setup.html',
  styleUrls: ['./process-setup.css']
})
export class ProcessSetup implements OnInit {
 
  // Inyecciones limpias
  private processService = inject(ProcessSetupService);
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef)

  // --- Variables para la Modalidad (Dinámicas) ---
  modalityOptions: DegreeOptionDTO[] = [];
  selectedModalityId: number | null = null;

  // --- Variables para Pestañas y Temas ---
  activeTab: 'banco' | 'proponer' = 'banco';
  selectedTopicId: number | null = null;

  // Formulario para proponer nuevo tema
  proposeForm: FormGroup;
  selectedFileName: string | null = null;

  // Datos simulados para el banco de temas
  bancoTemas = [
    {
      id: 1,
      titulo: 'Sistema de recomendación híbrido para e-commerce local',
      descripcion: 'Implementación de algoritmos de filtrado colaborativo y basado en contenido para optimizar las ventas de PyMES.',
      tags: ['IA & MACHINE LEARNING', '6 meses'],
      profesor: 'Dr. Roberto Pérez'
    },
    {
      id: 2,
      titulo: 'Automatización de despliegues con CI/CD en entornos en la nube',
      descripcion: 'Diseño de una arquitectura escalable utilizando Docker, Kubernetes y GitHub Actions para proyectos universitarios.',
      tags: ['DEVOPS', '4 meses'],
      profesor: 'Ing. María López'
    }
  ];

  constructor() {
    // Inicializamos el formulario en el constructor
    this.proposeForm = this.fb.group({
      titulo: ['', Validators.required],
      tipoProyecto: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  // Se ejecuta al cargar la página
  ngOnInit() {
    this.loadDegreeOptions();
  }

  // --- Lógica del Backend ---

  loadDegreeOptions() {
    this.processService.getActiveOptions().subscribe({
      next: (data) => {
        this.modalityOptions = data;
        // Seleccionamos la primera opción por defecto si existen datos
        if (this.modalityOptions.length > 0) {
          this.selectedModalityId = this.modalityOptions[0].idOption;
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las opciones de titulación', err);
      }
    });
  }

  getIconForOption(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('investigación') || nameLower.includes('investigacion')) return 'science';
    if (nameLower.includes('tecnológico') || nameLower.includes('tecnologico')) return 'memory';
    if (nameLower.includes('complexivo')) return 'quiz';
    if (nameLower.includes('emprendimiento')) return 'lightbulb';
    return 'library_books';
  }
  
  // --- Métodos de Interacción ---

  // Ahora recibe un ID (number) en lugar de un texto
  selectModality(idOption: number) {
    this.selectedModalityId = idOption;
  }

  switchTab(tab: 'banco' | 'proponer') {
    this.activeTab = tab;
  }

  selectTopic(id: number) {
    this.selectedTopicId = id;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
    }
  }

  cancelar() {
    console.log('Operación cancelada');
    // Aquí puedes redirigir al inicio: this.router.navigate(['/student/dashboard']);
  }

  guardar() {
    console.log('ID Modalidad seleccionada:', this.selectedModalityId);
    
    if (this.activeTab === 'banco') {
      console.log('Tema del Banco seleccionado (ID):', this.selectedTopicId);
    } else {
      console.log('Formulario de Nuevo Tema:', this.proposeForm.value);
    }
    
    alert('¡Configuración guardada exitosamente!');
  }
}