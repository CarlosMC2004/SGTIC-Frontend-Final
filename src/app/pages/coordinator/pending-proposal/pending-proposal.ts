import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PendingProposalService } from '../../../services/pending-proposal/pending-proposal';
import { AuthService } from '../../../services/auth.service';
import { PendingProposalDTO } from '../../../models/pending-proposal.model';
import { Topbar } from '../../../components/top-bar/top-bar';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { ModalRechazo } from '../../../components/modal-rechazo/modal-rechazo';
import { VerificacionIAResponse } from '../../../models/ia-duplication.model';

@Component({
  selector: 'app-pending-proposal',
  standalone: true,
  imports: [
    CommonModule,
    Topbar,
    SidebarComponent,
    RouterModule,
    ModalRechazo
  ],
  templateUrl: './pending-proposal.html',
  styleUrls: ['./pending-proposal.css']
})
export class PendingProposalComponent implements OnInit {
  propuestas: PendingProposalDTO[] = [];
  idCoordinador: number = 0;
  loading: boolean = true;
  mostrarModalRechazo: boolean = false;
  propuestaARechazarId: number | null = null;
  isLoadingIA: boolean = false;
  resultadoIA: VerificacionIAResponse | null = null;
  activeTab: 'estudiantes' | 'banco' = 'estudiantes';

  constructor(
    private proposalService: PendingProposalService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.idCoordinador = userId;
      this.cargarPropuestas();
    }
  }

  cargarPropuestas(): void {
    this.loading = true;
    this.proposalService.getPendientes(this.idCoordinador).subscribe({
      next: (data) => {
        this.propuestas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar propuestas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDocumento(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Esta propuesta no tiene un documento adjunto.');
    }
  }

  verificarDuplicado(idTemaPropuesto: number): void {
    this.isLoadingIA = true;
    this.resultadoIA = null;
    this.activeTab = 'estudiantes';
    this.cdr.detectChanges();

    this.proposalService.verificarDuplicidadIA(idTemaPropuesto).subscribe({
      next: (respuesta) => {
        this.resultadoIA = respuesta;
        this.isLoadingIA = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en la verificación con IA:', err);
        alert('Error al conectar con el motor de Inteligencia Artificial.');
        this.isLoadingIA = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarTab(tab: 'estudiantes' | 'banco'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  cerrarModalIA(): void {
    this.resultadoIA = null;
    this.isLoadingIA = false;
    this.cdr.detectChanges();
  }

  abrirModalRechazo(idPropuesta: number): void {
    this.propuestaARechazarId = idPropuesta;
    this.mostrarModalRechazo = true;
    this.cdr.detectChanges();
  }

  cerrarModalRechazo(): void {
    this.mostrarModalRechazo = false;
    this.propuestaARechazarId = null;
    this.cdr.detectChanges();
  }

  confirmarRechazo(motivo: string): void {
    if (this.propuestaARechazarId) {
      this.proposalService.responderPropuesta(this.propuestaARechazarId, 'rechazada', motivo).subscribe({
        next: () => {
          alert('Propuesta rechazada y feedback enviado al estudiante.');
          this.cerrarModalRechazo();
          this.cargarPropuestas();
        },
        error: (err) => {
          console.error('Error al rechazar:', err);
          alert('Error al procesar el rechazo.');
        }
      });
    }
  }

  aprobarPropuesta(idPropuesta: number): void {
    const confirmacion = confirm('¿Estás seguro de que deseas APROBAR esta propuesta?');
    if (confirmacion) {
      this.proposalService.responderPropuesta(idPropuesta, 'aprobada').subscribe({
        next: () => {
          alert('Propuesta aprobada con éxito.');
          this.cargarPropuestas();
        },
        error: (err) => {
          console.error('Error al aprobar:', err);
          alert('Error al procesar la solicitud.');
        }
      });
    }
  }
}
