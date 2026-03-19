import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import { TeacherAssignmentService } from '../../../services/teacher-assignment/teacher-assignment.service';
import { TeacherAssignment } from '../../../models/teacher-assignment.model';
import { PendingProject } from '../../../models/pending-project.model';
import { AiMatchResult } from '../../../models/ai-match-result.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, SidebarComponent, Topbar],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class Assignments implements OnInit {

  teachers: any[] = [];
  allTeachers: any[] = [];
  pendingProjects: PendingProject[] = [];
  selectedProjectId: number | null = null;

  loading: boolean = false;
  loadingAi: boolean = false;

  constructor(
    private assignmentService: TeacherAssignmentService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDocentes();
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    const idCoordinador = this.authService.getUserId();
    if (!idCoordinador) {
      console.error('No hay un coordinador logueado. Cancelando petición de proyectos...');
      return;
    }

    this.assignmentService.getPendingProjects(idCoordinador).subscribe({
      next: (data: PendingProject[]) => {
        this.pendingProjects = data;

        if (this.pendingProjects.length > 0 && this.selectedProjectId === null) {
          this.selectedProjectId = this.pendingProjects[0].idPropuesta;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar proyectos desde la BD:', err);
      }
    });
  }

  seleccionarProyecto(idPropuesta: number): void {
    this.selectedProjectId = idPropuesta;
  }

  cargarDocentes(): void {
    const idCoordinador = this.authService.getUserId();

    if (!idCoordinador) {
      console.error('No hay un coordinador logueado. Cancelando petición de docentes...');
      return;
    }

    this.loading = true;
    this.assignmentService.getAvailableTeachers(idCoordinador).subscribe({
      next: (data: TeacherAssignment[]) => {
        const mappedData = data.map(t => ({
          ...t,
          specializations: t.especialidades || [],
          matchScore: 0,
          razonIA: ''
        }));

        this.teachers = mappedData;
        this.allTeachers = [...mappedData];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar docentes desde la BD:', err);
        this.loading = false;
      }
    });
  }

  asignarDirector(teacher: any): void {
    if (!this.selectedProjectId) {
      alert('Por favor, seleccione un proyecto del panel izquierdo primero.');
      return;
    }

    if(confirm(`¿Desea asignar a ${teacher.nombreCompleto} como director al proyecto seleccionado?`)) {
      this.assignmentService.assignDirector(this.selectedProjectId, teacher.idDocente, 0).subscribe({
        next: (res: any) => {
          alert('¡Asignación exitosa! Se ha enviado la notificación por correo.');
          this.selectedProjectId = null;
          this.cargarDocentes();
          this.cargarProyectos();
        },
        error: (err: any) => {
          console.error('Error en la asignación:', err);
          alert('Hubo un problema al procesar la asignación.');
        }
      });
    }
  }

  // 4. BUSCADOR DE DOCENTES
  onSearch(event: any): void {
    const term = event.target.value.toLowerCase().trim();
    if (!term) {
      this.teachers = [...this.allTeachers];
      return;
    }
    this.teachers = this.allTeachers.filter(t =>
      t.nombreCompleto.toLowerCase().includes(term) ||
      t.specializations.some((spec: string) => spec.toLowerCase().includes(term))
    );
  }

  // 5. MAGIA DE LA INTELIGENCIA ARTIFICIAL
  solicitarSugerenciasIA(): void {
    if (!this.selectedProjectId) {
      alert('Por favor, selecciona un proyecto primero para que la IA lo analice.');
      return;
    }

    // Buscamos los detalles del proyecto que seleccionaste
    const proyectoSeleccionado: any = this.pendingProjects.find(p => p.idPropuesta === this.selectedProjectId);
    if (!proyectoSeleccionado) return;

    // Asegúrate de que las propiedades se llamen así en tu base de datos (tema/titulo y descripcion/resumen)
    const titulo = proyectoSeleccionado.tema || proyectoSeleccionado.titulo || 'Sin título';
    const descripcion = proyectoSeleccionado.descripcion || proyectoSeleccionado.resumen || 'Sin descripción';

    this.loadingAi = true; // Encendemos el estado de carga

    this.assignmentService.getAiSuggestions(titulo, descripcion, this.allTeachers).subscribe({
      next: (resultados: AiMatchResult[]) => {

        // Mezclamos los resultados de la IA con nuestros docentes
        this.allTeachers = this.allTeachers.map(docente => {
          // Buscamos qué puntaje le dio la IA a este docente en particular
          const sugerencia = resultados.find(r => r.idDocente === docente.idDocente);
          return {
            ...docente,
            matchScore: sugerencia ? sugerencia.matchScore : 0,
            razonIA: sugerencia ? sugerencia.razonIA : ''
          };
        });

        // Ordenamos la lista de mayor a menor porcentaje
        this.allTeachers.sort((a, b) => b.matchScore - a.matchScore);

        // Actualizamos las tarjetas en la pantalla
        this.teachers = [...this.allTeachers];
        this.loadingAi = false; // Apagamos el estado de carga
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al conectar con la IA:', err);
        alert('Hubo un problema al obtener sugerencias de la IA.');
        this.loadingAi = false;
        this.cdr.detectChanges();
      }
    });
  }
}
