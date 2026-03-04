import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa tus componentes Layout (Ajusta las rutas según tu proyecto)
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, Topbar],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {

  // Datos simulados basados en tu imagen para iterar en el HTML
  entregables = [
    { titulo: 'Capítulo 1: Introducción y Justificación', fecha: '15 Oct, 2025', icono: 'description' },
    { titulo: 'Diseño de la Metodología', fecha: '30 Oct, 2025', icono: 'bar_chart' }
  ];

  tutorias = [
    { fechaMes: 'OCT', fechaDia: '12', titulo: 'Revisión de Avances - Cap. 1', hora: '10:00 AM - 11:00 AM', tipo: 'virtual' },
    { fechaMes: 'OCT', fechaDia: '19', titulo: 'Taller de Normativa APA', lugar: 'Auditorio Central', tipo: 'presencial' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Aquí luego llamarás a tus servicios para cargar los datos reales
  }
}