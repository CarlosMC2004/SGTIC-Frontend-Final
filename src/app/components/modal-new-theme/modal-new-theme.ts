import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BanckTemaDTO } from '../../models/banck-tema.model';
import { BanckTemaService } from '../../services/banck-tema/banck-tema.service';
import { DegreeOptionService } from '../../services/degree-option/degree-option.service';
import { OptionCareerModel } from '../../models/option-career-model';

@Component({
  selector: 'app-modal-new-theme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-new-theme.html',
  styleUrl: './modal-new-theme.css',
})
export class ModalNewTheme implements OnInit {
  @Input() idUsuario: number = 0;
  @Input() temaAEditar: BanckTemaDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  opcionesTitulacion: OptionCareerModel[] = [];

  // Estructura inicial del objeto
  nuevoTema: BanckTemaDTO = {
    titulo: '',
    descripcion: '',
    nombreComision: '',
    idOpcion: 0
  };

  constructor(
    private banckTemaService: BanckTemaService,
    private degreeOptionService: DegreeOptionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarOpcionesTitulacion();
    if (this.temaAEditar) {
      this.nuevoTema = { ...this.temaAEditar };
    }
  }

  cargarOpcionesTitulacion(): void {
    this.degreeOptionService.getOptionsForCoordinator(this.idUsuario).subscribe({
      next: (data) => {
        this.opcionesTitulacion = data.filter(opt => opt.seleccionado);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar opciones:', err)
    });
  }

  onClose() {
    this.close.emit();
  }

  guardar() {
    if (!this.nuevoTema.titulo || !this.nuevoTema.nombreComision || !this.nuevoTema.idOpcion || this.nuevoTema.idOpcion === 0) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (this.nuevoTema.idTema) {
      this.banckTemaService.actualizarTema(this.nuevoTema).subscribe({
        next: () => {
          this.onSaved.emit();
          this.onClose();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el tema.');
        }
      });
    } else {
      // Si no hay ID, es un registro nuevo
      this.banckTemaService.guardarTema(this.nuevoTema, this.idUsuario).subscribe({
        next: () => {
          this.onSaved.emit();
          this.onClose();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Error al guardar el nuevo tema.');
        }
      });
    }
  }
}
