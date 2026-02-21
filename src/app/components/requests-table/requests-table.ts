import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRechazo } from '../modal-rechazo/modal-rechazo';
import { AdmissionRequestsService, AdmissionRequest } from '../../services/admission-requests.service';

@Component({
  selector: 'app-requests-table',
  standalone: true,
  imports: [ModalRechazo, CommonModule],
  templateUrl: './requests-table.html',
  styleUrl: './requests-table.css',
})

export class RequestsTable implements OnInit {
  showModal = false;
  requestsList: AdmissionRequest[] = [];

  constructor(private admissionService: AdmissionRequestsService) {
  }

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.admissionService.getAllRequests().subscribe({
      next: (datosDelBackend) => {
        this.requestsList = datosDelBackend;
      },
      error: (error) => {
        console.error('Error al cargar las solicitudes:', error);
      }
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
