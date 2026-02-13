import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar'; // Ajusta la ruta si es necesario
import { 
  ModalManagementStructureComponent, 
  FacultadSimple, 
  CarreraSimple 
} from '../../../components/modal-management-structure/modal-management-structure';

// Interfaces para la VISTA (son más complejas que las del modal porque tienen iconos, colores, etc)
interface CareerDisplay {
  name: string;
}

interface FacultyDisplay {
  id: number;
  name: string;
  subtitle: string;
  acronym: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  careersCount: number;
  careers: CareerDisplay[];
}

@Component({
  selector: 'app-institutional-structure',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ModalManagementStructureComponent], // <--- Importante
  templateUrl: './institutional-structure.html',
  styleUrls: ['./institutional-structure.css']
})
export class InstitutionalStructureComponent {
  
  // --- CONTROL DEL MODAL ---
  showModal: boolean = false;
  currentModalTab: 'facultad' | 'carrera' = 'facultad';
  selectedFacultyId: number | null = null;

  // 1. Función para abrir el modal desde "Nueva Facultad" o "Agregar Carrera"
  openModal(type: 'facultad' | 'carrera', facultyId?: number) {
    this.currentModalTab = type;
    this.selectedFacultyId = facultyId || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFacultyId = null;
  }

  // 2. Transformamos los datos complejos de la vista a datos simples para el select del modal
  get mappedFacultiesForModal(): FacultadSimple[] {
    return this.faculties.map(f => ({
      id_facultad: f.id,
      nombre: f.name,
      siglas: f.acronym
    }));
  }

  // --- LÓGICA DE GUARDADO (Simulada) ---
  handleSaveFacultad(newFac: FacultadSimple) {
    const newId = this.faculties.length + 1;
    // Agregamos a la lista visual
    this.faculties.push({
      id: newId,
      name: newFac.nombre,
      subtitle: 'Nueva Facultad Registrada',
      acronym: newFac.siglas,
      icon: 'school', // Icono por defecto
      iconBg: '#f5f5f5',
      iconColor: '#333',
      careersCount: 0,
      careers: []
    });
    this.closeModal();
  }

  handleSaveCarrera(newCarrera: CarreraSimple) {
    // Buscamos la facultad seleccionada y agregamos la carrera
    const facultyIndex = this.faculties.findIndex(f => f.id === newCarrera.id_facultad);
    if (facultyIndex !== -1) {
      this.faculties[facultyIndex].careers.push({ name: newCarrera.nombre });
      this.faculties[facultyIndex].careersCount++;
    }
    this.closeModal();
  }

  // --- DATOS DE EJEMPLO (Visualización) ---
  stats = [
    { title: 'Facultades Activas', value: '12', icon: 'school' },
    { title: 'Carreras Totales', value: '48', icon: 'book' },
    { title: 'Estudiantes', value: '4,250', icon: 'groups' }
  ];

  faculties: FacultyDisplay[] = [
    {
      id: 1,
      name: 'Ingeniería',
      subtitle: 'Facultad de Ciencias Aplicadas',
      acronym: 'FCI', // Importante tener esto
      icon: 'engineering',
      iconBg: '#e8f5e9',
      iconColor: '#2e7d32',
      careersCount: 8,
      careers: [
        { name: 'Ingeniería de Software' },
        { name: 'Ingeniería Civil' }
      ]
    },
    {
      id: 2,
      name: 'Ciencias Sociales',
      subtitle: 'División de Humanidades',
      acronym: 'FCS',
      icon: 'groups',
      iconBg: '#f1f8e9',
      iconColor: '#558b2f',
      careersCount: 5,
      careers: [
        { name: 'Psicología Clínica' }
      ]
    }
    // ... puedes agregar más
  ];

  currentPage = 1;
}