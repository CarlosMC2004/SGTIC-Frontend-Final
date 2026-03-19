import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teachers/teachers';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../components/header/header';
import {SidebarComponent} from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import {ModalEditTeacher} from '../../../components/modal-edit-teacher/modal-edit-teacher';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, Topbar, ModalEditTeacher],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  terminoBusqueda: string = '';
  allTeachers: any[] = [];
  teachers: any[] = [];
  cargando: boolean = false;
  selectedTeacher: any = null;
  filtroEstado: string = 'todos';

  constructor(
    private docenteService: TeacherService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDocentes();
  }

  cargarDocentes() {
    this.cargando = true;
    const idUsuario = this.authService.getUserId();

    if (idUsuario) {
      this.docenteService.getDocentesPorFacultad(idUsuario).subscribe({
        next: (data) => {
          this.allTeachers = data;
          this.aplicarFiltros();
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al cargar docentes:", err);
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  aplicarFiltros() {
    let listaFiltrada = [...this.allTeachers];

    if (this.terminoBusqueda) {
      listaFiltrada = listaFiltrada.filter(t =>
        t.nombreCompleto.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    }

    if (this.filtroEstado === 'activo') {
      listaFiltrada = listaFiltrada.filter(t => t.activo === true);
    } else if (this.filtroEstado === 'inactivo') {
      listaFiltrada = listaFiltrada.filter(t => t.activo === false);
    }

    this.teachers = listaFiltrada;
    this.cdr.detectChanges();
  }

  cambiarEstado(teacher: any) {
    const estadoString = teacher.activo ? 'activo' : 'inactivo';

    this.docenteService.actualizarEstado(teacher.idDocente, estadoString).subscribe({
      next: () => {
        console.log(`Estado de ${teacher.nombreCompleto} actualizado a ${estadoString}`);
        teacher.estado = estadoString;
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error("Error al cambiar estado:", err);
        teacher.activo = !teacher.activo;
        this.cdr.detectChanges();
        alert("No se pudo cambiar el estado en la base de datos.");
      }
    });
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  editarDocente(teacher: any) {
    this.selectedTeacher = teacher ? { ...teacher } : {};
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.selectedTeacher = null;
    this.cargarDocentes();
  }

  guardarDocente(docenteData: any) {
    // Obtenemos el ID del coordinador que inició sesión
    const idUsuario = this.authService.getUserId();

    // Inyectamos ese ID en los datos que van al backend
    const datosParaBackend = {
      ...docenteData,
      idUsuarioLogueado: idUsuario
    };

    console.log("Datos a guardar con coordinador:", datosParaBackend);

    this.docenteService.guardarDocente(datosParaBackend).subscribe({
      next: (response) => {
        console.log("Docente guardado con éxito");
        this.closeEditModal();
      },
      error: (err) => {
        console.error("Error al guardar el docente:", err);
        alert("Hubo un error al guardar los datos del docente.");
      }
    });
  }
}
