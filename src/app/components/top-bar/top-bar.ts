import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodoService } from '../../services/modelo-service/periodo.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.css']
})
export class Topbar implements OnInit {
  periodos: any[] = [];
  periodosActivos: any[] = [];
  periodoSeleccionado: any = null;
  
  isProfileMenuOpen = false;
  isPeriodMenuOpen = false;

  constructor(private periodoService: PeriodoService) {}

  ngOnInit() {
    this.cargarPeriodos();
  }

  cargarPeriodos() {
    console.log('Cargando períodos...');
    // 👇 CAMBIA ESTO: usa getPeriodosActivos() en lugar de getPeriodos()
    this.periodoService.getPeriodosActivos().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.periodos = data; // Todos son activos porque viene de /active
        this.periodosActivos = data; // Todos son activos
        
        console.log('Períodos activos:', this.periodosActivos);
        
        // Seleccionar el primer período activo por defecto
        if (this.periodosActivos.length > 0) {
          this.periodoSeleccionado = this.periodosActivos[0];
          console.log('Período seleccionado:', this.periodoSeleccionado);
        }
      },
      error: (error) => {
        console.error('Error al cargar períodos:', error);
        // Datos de ejemplo para pruebas si el backend falla
        this.periodosActivos = [
          { idPeriod: 1, name: 'REGULAR 2025-2026 SPA', active: true },
          { idPeriod: 2, name: 'REGULAR 2024-2025 SPA', active: true }
        ];
        this.periodoSeleccionado = this.periodosActivos[0];
      }
    });
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isPeriodMenuOpen = false;
  }

  togglePeriodMenu(event: Event) {
    event.stopPropagation();
    this.isPeriodMenuOpen = !this.isPeriodMenuOpen;
    this.isProfileMenuOpen = false;
  }

  seleccionarPeriodo(periodo: any) {
    console.log('Período seleccionado:', periodo);
    this.periodoSeleccionado = periodo;
    this.isPeriodMenuOpen = false;
  }

  @HostListener('document:click')
  closeMenus() {
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
  }
}