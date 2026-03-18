import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PendingProposalService } from '../../../services/pending-proposal/pending-proposal';
import { AuthService } from '../../../services/auth.service';
import { PendingProposalDTO } from '../../../models/pending-proposal.model';
import { HeaderComponent } from '../../../components/header/header';
import { SidebarComponent } from '../../../components/sidebar/sidebar';

@Component({
  selector: 'app-pending-proposal',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    RouterModule
  ],
  templateUrl: './pending-proposal.html',
  styleUrls: ['./pending-proposal.css']
})
export class PendingProposalComponent implements OnInit {
  propuestas: PendingProposalDTO[] = [];
  idCoordinador: number = 0;
  loading: boolean = true;

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
      this.cdr.detectChanges();
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
      }
    });
  }

  procesarPropuesta(idPropuesta: number, nuevoEstado: string): void {
    const confirmacion = confirm(`¿Estás seguro de que deseas marcar esta propuesta como ${nuevoEstado}?`);

    if (confirmacion) {
      this.proposalService.responderPropuesta(idPropuesta, nuevoEstado).subscribe({
        next: () => {
          this.propuestas = this.propuestas.filter(p => p.idTemaPropuesto !== idPropuesta);
          alert(`Propuesta ${nuevoEstado} con éxito.`);
        },
        error: (err) => alert('Error al procesar la solicitud.')
      });
    }
  }

  verDocumento(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Esta propuesta no tiene un documento adjunto.');
    }
  }
}
