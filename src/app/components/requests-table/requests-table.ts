import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  solicitudSeleccionadaId: number = 0;
  requestsList: AdmissionRequest[] = [];
  allRequests: AdmissionRequest[] = [];
  idCarreraDelCoordinador: number = 4;
  totalPendientes: number = 0;
  totalAprobadas: number = 0;
  totalRechazadas: number = 0;
  estadoActual: string = 'todas';
  terminoBusqueda: string = '';

  @Output() estadisticasCalculadas = new EventEmitter<any>();

  constructor(private admissionService: AdmissionRequestsService) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.admissionService.getRequestsByCareer(this.idCarreraDelCoordinador).subscribe({
      next: (datos) => {
        this.allRequests = datos;
        this.calcularEstadisticas();
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar:', err)
    });
  }

  aplicarFiltros() {
    let resultado = [...this.allRequests];

    if (this.estadoActual !== 'todas') {
      resultado = resultado.filter(req => req.estado?.toLowerCase() === this.estadoActual);
    }

    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(req =>
        req.nombres?.toLowerCase().includes(termino) ||
        req.apellidos?.toLowerCase().includes(termino) ||
        req.identificacion?.includes(termino)
      );
    }

    this.requestsList = resultado;
  }

  calcularEstadisticas() {
    this.totalPendientes = this.allRequests.filter(req => req.estado?.toLowerCase() === 'pendiente').length;
    this.totalAprobadas = this.allRequests.filter(req => req.estado?.toLowerCase() === 'aprobada').length;
    this.totalRechazadas = this.allRequests.filter(req => req.estado?.toLowerCase() === 'rechazada').length;

    this.estadisticasCalculadas.emit({
      pendientes: this.totalPendientes,
      aprobadas: this.totalAprobadas,
      rechazadas: this.totalRechazadas
    });
  }

  onFilterChange(event: any) {
    this.estadoActual = event.target.value;
    this.aplicarFiltros();
  }

  onSearch(event: any) {
    this.terminoBusqueda = event.target.value;
    this.aplicarFiltros();
  }

  aprobar(id: number) {
    if(confirm('¿Estás seguro de aprobar esta solicitud?')) {
      this.admissionService.aprobarSolicitud(id).subscribe({
        next: (respuesta) => {
          console.log(respuesta.mensaje);
          this.cargarSolicitudes(); // 👈 ¡Magia! Recarga la tabla y las tarjetas solas
        },
        error: (err) => {
          alert('Error al aprobar: ' + (err.error?.error || 'Error desconocido'));
        }
      });
    }
  }

  openModal(id: number) {
    this.solicitudSeleccionadaId = id;
    this.showModal = true;
  }

  confirmarRechazo(motivo: string) {
    this.admissionService.rechazarSolicitud(this.solicitudSeleccionadaId, motivo).subscribe({
      next: (respuesta) => {
        console.log(respuesta.mensaje);
        this.closeModal(); // Cerramos el modal
        this.cargarSolicitudes(); // Recargamos la tabla y tarjetas
      },
      error: (err) => {
        alert('Error al rechazar: ' + (err.error?.error || 'Error desconocido'));
      }
    });
  }

  closeModal() { this.showModal = false; }
}
