import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
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
  periodoSeleccionado: any = null;
  
  isProfileMenuOpen = false;
  isPeriodMenuOpen = false;

  constructor(
    private periodoService: PeriodoService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('✅ Constructor ejecutado');
  }

  ngOnInit() {
    console.log('✅ ngOnInit ejecutado');
    this.cargarPeriodos();
  }

  cargarPeriodos() {
    console.log('📡 Cargando períodos...');
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
        console.log('📦 Datos recibidos:', data);
        console.log('📦 Tipo de datos:', typeof data);
        console.log('📦 ¿Es array?', Array.isArray(data));
        console.log('📦 Longitud:', data.length);
        
        this.periodos = data;
        console.log('📦 periodos después de asignar:', this.periodos);
        
        if (this.periodos.length > 0) {
          console.log('🎯 Primer período:', this.periodos[0]);
          this.periodoSeleccionado = this.periodos[0];
          console.log('🎯 periodoSeleccionado asignado:', this.periodoSeleccionado);
          
          // FORZAR DETECCIÓN DE CAMBIOS
          this.cdr.detectChanges();
          console.log('🔄 detectChanges ejecutado');
          
          // Verificar después de detectChanges
          setTimeout(() => {
            console.log('⏱️ Verificación retardada - periodoSeleccionado:', this.periodoSeleccionado);
          }, 1000);
        } else {
          console.log('⚠️ No hay períodos en el array');
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
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
    console.log('👆 Seleccionando período:', periodo);
    this.periodoSeleccionado = periodo;
    this.isPeriodMenuOpen = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  closeMenus() {
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
  }
}