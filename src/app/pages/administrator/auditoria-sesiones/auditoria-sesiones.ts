import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../../services/auditorias/auditoria.service';

@Component({
  selector: 'app-auditoria-sesiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria-sesiones.html',
  styleUrls: ['./auditoria-sesiones.css']
})
export class AuditoriaSesionesComponent implements OnInit {
  private auditoriaService = inject(AuditoriaService);

  tabActiva: string = 'sesiones';
  filtroEstado: string = 'Todos los estados';
  cargando: boolean = true;
  sesiones: any[] = [];

  ngOnInit() {
    this.cargarSesiones();
  }

  cargarSesiones() {
    this.cargando = true;
    this.auditoriaService.obtenerSesionesUsuarios().subscribe({
      next: (data) => {
        this.sesiones = data.map(user => {

          // 🔥 LA LÓGICA REAL: Si tiene fecha de expulsión, está inactivo
          const estadoReal = user.fecha_expulsion ? 'INACTIVA' : 'ACTIVA';

          return {
            idUsuario: user.idusuario,
            inicial: user.inicial,
            correo: user.correo,
            perfil: user.perfil,
            fechaConexion: user.fecha_conexion ? new Date(user.fecha_conexion).toLocaleString() : 'Nunca',
            ip: user.ip_address ? user.ip_address.split('/')[0] : 'Local/Desconocida',
            estado: estadoReal // Asignamos el estado calculado
          };
        });
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error trayendo usuarios de la BD', err);
        this.cargando = false;
      }
    });
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  cerrarSesionForzada(sesion: any) {
    const confirmar = confirm(`⚠️ ¿Estás seguro de cerrar la sesión de ${sesion.correo}?`);
    if (confirmar) {
      this.auditoriaService.cerrarSesionUsuario(sesion.idUsuario).subscribe({
        next: () => {
          alert(`Sesión de ${sesion.correo} cerrada con éxito.`);
          this.cargarSesiones(); //
        },
        error: (err) => alert('Hubo un error al intentar desconectar al usuario.')
      });
    }
  }
}
