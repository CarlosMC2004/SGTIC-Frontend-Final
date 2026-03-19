import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {TeacherService} from '../../../services/teachers/teachers';
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
  especialidades: string[] = [];
  cargando: boolean = false;
  selectedTeacher: any = null;

  filtroDisponibilidad: string = 'todos';
  filtroEspecialidad: string = 'todos';

  constructor(private docenteService: TeacherService) {}

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.cargando = true;
    this.docenteService.buscarDocentes(this.terminoBusqueda).subscribe({
      next: (data) => {
        this.allTeachers = data;

        const titulosUnicos = new Set(data.map((t: any) => t.degree));
        this.especialidades = Array.from(titulosUnicos);

        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error:", err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    let listaFiltrada = [...this.allTeachers];

    if (this.filtroDisponibilidad === 'disponible') {
      listaFiltrada = listaFiltrada.filter(t => t.workload < 5);
    } else if (this.filtroDisponibilidad === 'lleno') {
      listaFiltrada = listaFiltrada.filter(t => t.workload >= 5);
    }

    if (this.filtroEspecialidad !== 'todos') {
      listaFiltrada = listaFiltrada.filter(t => t.degree === this.filtroEspecialidad);
    }

    this.teachers = listaFiltrada;
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  editarDocente(teacher: any) { this.selectedTeacher = teacher; }
  closeEditModal() { this.selectedTeacher = null; }
  getWorkloadPercentage(value: number): string { return (value / 5) * 100 + '%'; }
  getProgressBarColor(value: number): string { return value === 5 ? '#ef4444' : '#27684a'; }
}
