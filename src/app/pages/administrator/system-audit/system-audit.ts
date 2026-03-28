import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuditoriaService } from '../../../services/auditoria.service';
import { AuditoriaSistema } from '../../../models/auditoria.model';

@Component({
  selector: 'app-system-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './system-audit.html',
  styleUrl: './system-audit.css'
})
export class SystemAuditComponent implements OnInit {

  historial: AuditoriaSistema[] = [];
  cargando: boolean = true;

  constructor(private auditoriaService: AuditoriaService) { }

  ngOnInit(): void {
    this.obtenerDatosAuditoria();
  }

  obtenerDatosAuditoria(): void {
    this.cargando = true;
    this.auditoriaService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al traer la auditoría:', error);
        this.cargando = false;
      }
    });
  }

  formatearJSON(jsonString: string): string {
    if (!jsonString) return '';
    try {
      const objeto = JSON.parse(jsonString);
      return JSON.stringify(objeto, null, 2);
    } catch (e) {
      return jsonString;
    }
  }
}
