import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // 1. IMPORTANTE: Para que funcione routerLink
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';
import { ModalNewTheme } from '../../../components/modal-new-theme/modal-new-theme';
import { BanckTemaDTO } from '../../../models/banck-tema.model';
import { BanckTemaService } from '../../../services/banck-tema/banck-tema.service';
import { AuthService } from '../../../services/auth.service';
import { PendingProposalService } from '../../../services/pending-proposal/pending-proposal';

@Component({
  selector: 'app-bank-themes',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ModalNewTheme,
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './bank-themes.html',
  styleUrl: './bank-themes.css',
})
export class BankThemes implements OnInit {

  temas: BanckTemaDTO[] = [];
  idUsuarioActual: number = 0;
  showModal = false;
  temaSeleccionado: BanckTemaDTO | null = null;

  pendientesCount: number = 0;

  constructor(
    private banckTemaService: BanckTemaService,
    private pendingService: PendingProposalService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.idUsuarioActual = userId;
      this.cargarTemas();
      this.cargarConteoPendientes();
    } else {
      console.error('No se encontró el ID del usuario en el token');
    }
  }

  cargarConteoPendientes(): void {
    this.pendingService.getPendientes(this.idUsuarioActual).subscribe({
      next: (data) => {
        this.pendientesCount = data.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar conteo de pendientes:', err)
    });
  }

  cargarTemas(): void {
    this.banckTemaService.getTemasPorUsuario(this.idUsuarioActual).subscribe({
      next: (data) => {
        console.log('TEMAS RECIBIDOS:', data);
        this.temas = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar temas:', err)
    });
  }

  abrirModal(tema?: BanckTemaDTO) {
    if (tema) {
      this.temaSeleccionado = { ...tema };
    } else {
      this.temaSeleccionado = null;
    }
    this.showModal = true;
  }

  eliminarTema(idTema?: number): void {
    if (!idTema) return;

    if (confirm('¿Estás seguro de que deseas eliminar este tema del banco?')) {
      this.banckTemaService.eliminar(idTema).subscribe({
        next: () => {
          console.log('Tema eliminado correctamente');
          this.cargarTemas();
        },
        error: (err) => console.error('Error al eliminar tema:', err)
      });
    }
  }

  recargarYcerrar() {
    this.cargarTemas();
    this.cerrarModal();
  }

  cerrarModal() {
    this.showModal = false;
    this.temaSeleccionado = null;
  }
}
