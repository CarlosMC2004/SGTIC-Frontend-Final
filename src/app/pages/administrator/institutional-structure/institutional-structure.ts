import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'; // 1. Agregamos OnInit
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { ModalManagementStructureComponent, FacultadSimple, CarreraSimple } from '../../../components/modal-management-structure/modal-management-structure';

import { FacultyDashboardAdmin, FacultyDashboardDTO} from '../../../services/faculty-dashboard-admin/faculty-dashboard-admin';
import { FacultyCreate, FacultyCreateDTO } from '../../../services/faculty-create/faculty-create';
import { CareerCreate, CareerCreateDTO } from '../../../services/career-create/career-create';
import { ManageCareer } from '../../../services/manage-career/manage-career';

interface CareerDisplay {
  id: number;
  name: string;
  active: boolean;
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
  imports: [CommonModule, ModalManagementStructureComponent],
  templateUrl: './institutional-structure.html',
  styleUrls: ['./institutional-structure.css']
})
export class InstitutionalStructureComponent implements OnInit {

  private updateCareerServices = inject(ManageCareer);
  private writeCareerService = inject(CareerCreate)
  private writeFacultyService = inject(FacultyCreate);
  private facultyServices = inject(FacultyDashboardAdmin);
  private cd = inject(ChangeDetectorRef)

  showModal = false;
  currentModalTab: 'facultad' | 'carrera' = 'facultad';
  selectedFacultyId: number | null = null;

  //Estas variables que pongo aquí son para la edición
  isEditMode = false;
  dataToEdit: any = null;

  stats = [
    {Title: 'Facultades Activas', values: '...', icon: 'school'},
    {Title: 'Carreras Totales', values: '0', icon: 'book'},
    {Title: 'Estudiantes', values: '453', icon: 'groups'}
  ];

  faculties: FacultyDisplay[] = [];

  ngOnInit() {
    this.cargarDatosDelBackend();
  }

  cargarDatosDelBackend() {
    this.facultyServices.getDashboardData().subscribe({
      next: (data: FacultyDashboardDTO[]) => {
        //Esto actualiza los stats que están estaticos en la parte de arriba
        this.stats[0].values = data.length.toString();
        const totatCarreras = data.reduce((acc, curr) => acc + curr.careersCount, 0)  ;
        this.stats[1].values = totatCarreras.toString();

        // Esto mapea los datos
        this.faculties = data.map(dto => ({
          id: dto.id,
          name: dto.name,
          subtitle: dto.subtitle || 'Facultad',
          acronym: dto.subtitle,

          //PArte de estilos
          icon: dto.icon || 'school',
          iconBg: dto.iconBg || '#e8f5e9',
          iconColor: dto.iconColor || '#2e7d32',

          careersCount: dto.careersCount,

          careers: dto.careers ? dto.careers.map((c: any, index: number) => ({
            id: c.id || index,
            name: c.name || c,
            active: c.active !== undefined ? c.active : true
          })) : []
        }));
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error("Erro conectando con Spring Boot:", err);
        this.stats[0].values = 'Error'
        this.cd.detectChanges();
      }
    });
  }

  get mappedFacultiesForModal(): FacultadSimple[] {
    return this.faculties.map(f => ({
      id_facultad: f.id,
      nombre: f.name,
      siglas: f.acronym
    }));
  }

  openModal(type: 'facultad' | 'carrera', facultyId?: number) {
    this.isEditMode = false;
    this.dataToEdit = null;
    this.currentModalTab = type;
    this.selectedFacultyId = facultyId || null;
    this.showModal = true;
  }

  openEditModal(career: CareerDisplay, faculty: FacultyDisplay) {
    this.isEditMode = true;
    this.currentModalTab = 'carrera';
    this.selectedFacultyId = faculty.id;

    this.dataToEdit = {
      id_facultad: faculty.id,
      nombre: career.name,
      id_carrera: career.id
    };

    this.showModal = true
  }

  closeModal(){
    this.showModal = false;
    this.selectedFacultyId = null;
    this.isEditMode = false;
    this.dataToEdit = null;
  }

/*---------------------------------------------------------------------------------------------------------------------------
                                                      Agregar Nueva Facultad
---------------------------------------------------------------------------------------------------------------------------*/

  handleSaveFacultad(newFac: FacultadSimple) {
    if(this.isEditMode){
      console.log('Actualizando facultad...', newFac)
      return;
    }

    const dto: FacultyCreateDTO = {
      name: newFac.nombre,
      acronym: newFac.siglas
    };

    this.writeFacultyService.createFaculty(dto).subscribe({
      next: (response) => {
        this.closeModal();
        this.cargarDatosDelBackend();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Error al guardar la facultad';
        alert(errorMessage);
      }
    });
  }


/*---------------------------------------------------------------------------------------------------------------------------
                                                      Agregar Nueva Facultad
---------------------------------------------------------------------------------------------------------------------------*/


  handleSaveCarrera(newFac: CarreraSimple) {

    if (!newFac.id_facultad) {
      alert('Por favor, selecciona una facultad antes de guardar.');
      return;
    }

    if (this.isEditMode && newFac.id_carrera) {
      const updateDto = {
        idCareer: newFac.id_carrera,
        faculty: newFac.id_facultad,
        name: newFac.nombre
      };

      this.updateCareerServices.updateCareer(newFac.id_carrera, updateDto).subscribe ({
        next: (response) => {
          this.closeModal();
          this.cargarDatosDelBackend();
        },
        error: (err) => {
          const errorMessage = err.error?.error || 'Error al actualizar la carrera';
          alert(errorMessage);
        }
      });

      return;
    }

    const dto: CareerCreateDTO = {
      faculty: newFac.id_facultad,
      name: newFac.nombre
    };

    this.writeCareerService.createCareer(dto).subscribe({
      next: (response) => {
        this.closeModal();
        this.cargarDatosDelBackend();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Error al guardar la carrera';
        alert(errorMessage);
      }
    });
  }

  toggleCareerStatus(career: CareerDisplay) {
    const action = career.active ? 'desactivar' : 'activar';

    if(confirm(`¿Estás seguro de que deseas ${action} la carrera ${career.name}?`)) {
      this.updateCareerServices.toggleCareerStatus(career.id).subscribe({
        next: (response) => {
          career.active = !career.active;
          this.cd.detectChanges();
        },
        error: (err) => {
          const errorMessage = err.error?.error || 'Error al cambiar el estado de la carrera';
          alert(errorMessage);
        }
      });
    }
  }
}
