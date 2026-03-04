import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';
import { RequestsTable } from '../../../components/requests-table/requests-table';
import { StatusCardComponent } from '../../../components/status-card/status-card';

@Component({
  selector: 'app-student-requests',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    RequestsTable,
    StatusCardComponent
  ],
  templateUrl: './student-requests.html',
  styleUrl: './student-requests.css',
})
export class StudentRequests {

  numPendientes: number = 0;
  numAprobadas: number = 0;
  numRechazadas: number = 0;

  recibirEstadisticas(stats: any) {
    this.numPendientes = stats.pendientes;
    this.numAprobadas = stats.aprobadas;
    this.numRechazadas = stats.rechazadas;
  }

}
