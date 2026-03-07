import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';
import { DegreeOptionService } from '../../../services/degree-option/degree-option.service';
import {OptionCareerModel} from '../../../models/option-career-model';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-degree-options',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './degree-options.html',
  styleUrl: './degree-options.css'
})
export class DegreeOptions implements OnInit {

  opciones: OptionCareerModel[] = [];
  filteredOptions: OptionCareerModel[] = [];
  idUsuarioActual: number = 0;
  searchTerm: string = '';
  estadoActual: string = 'todos';
  constructor(
    private degreeService: DegreeOptionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.idUsuarioActual = userId;
      this.cargarOpciones();
    } else {
      console.error('No se encontró el ID del usuario en el token');
    }
  }

  cargarOpciones(): void {
    this.degreeService.getOptionsForCoordinator(this.idUsuarioActual).subscribe({
      next: (data) => {
        console.log('DATOS DEL BACKEND:', data);
        this.opciones = data;
        this.aplicarFiltros();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar datos:', err)
    });
  }

  aplicarFiltros(): void {
    if (!this.opciones) return;
    this.filteredOptions = this.opciones.filter(opt => {
      const termino = this.searchTerm?.toLowerCase() || '';
      const cumpleBusqueda = opt.nombre?.toLowerCase().includes(termino) || false;

      const cumpleEstado = this.estadoActual === 'todos' ||
        (this.estadoActual === 'seleccionados' && opt.seleccionado) ||
        (this.estadoActual === 'no_seleccionados' && !opt.seleccionado);
      return cumpleBusqueda && cumpleEstado;
    });
  }

  setFilter(status: string) {
    this.estadoActual = status;
    this.aplicarFiltros();
  }

  onToggle(opcion: OptionCareerModel): void {
    this.degreeService.toggleCoordinatorOption(this.idUsuarioActual!, opcion.id_opcion, opcion.seleccionado)
      .subscribe({
        next: () => {
          console.log(`Guardado en BD: ${opcion.nombre} -> ${opcion.seleccionado}`);
        },
        error: (err) => {
          console.error('Error al guardar en BD:', err);
          opcion.seleccionado = !opcion.seleccionado;
        }
      });
  }
}
