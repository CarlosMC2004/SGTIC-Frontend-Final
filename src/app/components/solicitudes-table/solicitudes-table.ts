import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRechazo } from '../modal-rechazo/modal-rechazo';

@Component({
  selector: 'app-solicitudes-table',
  standalone: true,
  imports: [CommonModule, ModalRechazo],
  templateUrl: './solicitudes-table.html',
  styleUrls: ['./solicitudes-table.css']
})
export class SolicitudesTableComponent {

  showModal = false;
  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }
}

export class SolicitudesTable {
}
