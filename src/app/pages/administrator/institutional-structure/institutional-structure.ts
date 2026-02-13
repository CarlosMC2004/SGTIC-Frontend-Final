import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import {
  ModalManagementStructureComponent,
  FacultadSimple,
  CarreraSimple
} from '../../../components/modal-management-structure/modal-management-structure';
import {HeaderComponent} from '../../../components/header/header';

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
  imports: [CommonModule, SidebarComponent, ModalManagementStructureComponent, HeaderComponent],
  templateUrl: './institutional-structure.html',
  styleUrls: ['./institutional-structure.css']
})
export class InstitutionalStructureComponent {

  // CONTROL DEL MODAL
  showModal: boolean = false;
  currentModalTab: 'facultad' | 'carrera' = 'facultad';
  selectedFacultyId: number | null = null;

  //Función para abrir el modal desde "Nueva Facultad" o "Agregar Carrera"
  openModal(type: 'facultad' | 'carrera', facultyId?: number) {
    this.currentModalTab = type;
    this.selectedFacultyId = facultyId || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFacultyId = null;
  }

  //Transformamos los datos complejos de la vista a datos simples para el select del modal
  get mappedFacultiesForModal(): FacultadSimple[] {
    return this.faculties.map(f => ({
      id_facultad: f.id,
      nombre: f.name,
      siglas: f.acronym
    }));
  }

  handleSaveFacultad(newFac: FacultadSimple) {
    const newId = this.faculties.length + 1;
    // Agregamos a la lista visual
    this.faculties.push({
      id: newId,
      name: newFac.nombre,
      subtitle: 'New Registered Faculty',
      acronym: newFac.siglas,
      icon: 'school',
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

  stats = [
    { title: 'Active Faculties', value: '12', icon: 'school' },
    { title: 'Total Programs', value: '48', icon: 'book' },
    { title: 'Students', value: '4,250', icon: 'groups' }
  ];


  faculties: FacultyDisplay[] = [
    {
      id: 1,
      name: 'Engineering',
      subtitle: 'Faculty of Applied Sciences',
      acronym: 'FCI',
      icon: 'engineering',
      iconBg: '#e8f5e9',
      iconColor: '#2e7d32',
      careersCount: 8,
      careers: [
        { name: 'Software Engineering' },
        { name: 'Civil Engineering' }
      ]
    },
    {
      id: 2,
      name: 'Social Sciences',
      subtitle: 'Division of Humanities',
      acronym: 'FSS',
      icon: 'groups',
      iconBg: '#f1f8e9',
      iconColor: '#558b2f',
      careersCount: 5,
      careers: [
        { name: 'Clinical Psychology' }
      ]
    }

  ];
  currentPage = 1;
}
