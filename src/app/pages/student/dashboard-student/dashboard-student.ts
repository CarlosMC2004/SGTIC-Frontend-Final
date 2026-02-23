import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar'; // Ajusta la ruta si es necesario

// Importamos los sub-componentes (Asumo que los crearás en una carpeta 'components' dentro del módulo del estudiante)
import { ProgressChartComponent } from '../../../components/components-studients/progress-chart/progress-chart';
import { UpcomingDeliveriesComponent } from '../../../components/components-studients/upcoming-deliveries/upcoming-deliveries';
import { PendingMeetingsComponent } from '../../../components/components-studients/pending-meetings/pending-meetings';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ProgressChartComponent,
    UpcomingDeliveriesComponent,
    PendingMeetingsComponent
  ],
  templateUrl: '././dashboard-student.html',
  styleUrls: ['././dashboard-student.css']
})
export class StudentDashboardComponent implements OnInit {

  upcomingDeliveries = [
    { title: 'Capítulo 1: Introducción', date: '15 Oct, 2025', status: 'Pendiente', statusClass: 'warning' },
    { title: 'Propuesta de Tema', date: '01 Oct, 2025', status: 'Entregado', statusClass: 'success' },
    { title: 'Revisión Bibliográfica', date: '20 Sep, 2025', status: 'Atrasado', statusClass: 'danger' }
  ];

  pendingMeetings = [
    { title: 'Revisión de Avances C1', with: 'Ing. Juan Pérez (Tutor)', date: '12 Oct, 2025', time: '10:00 AM' },
    { title: 'Aprobación de Plan', with: 'Dra. María Lopez', date: '18 Oct, 2025', time: '15:30 PM' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Aquí llamarías a tu servicio para cargar los datos reales
  }
}