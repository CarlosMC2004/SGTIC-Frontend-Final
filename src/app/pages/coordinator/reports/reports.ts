import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { StatisticsReport } from '../../../services/statistics-report/statistics-report';
import { AuthService } from '../../../services/auth.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {

  listadoPeriodos: any[] = [];
  listadoEstados: string[] = [];
  listadoDocentes: any[] = [];
  docentesTable: any[] = [];
  estudiantesTable: any[] = [];

  estadisticas: any = {
    temasAprobados: 0,
    temasPendientes: 0,
    temasRechazados: 0,
    totalTemas: 0,
    temasBanco: 0,
    temasPropuesta: 0
  };

  nombreCarreraActual: string = '';
  idCarreraActual: number = 0;
  filtroPeriodo: number = 0;
  filtroEstado: string = '';
  filtroDirector: number = 0;

  constructor(
    private reportService: StatisticsReport,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const carreraId = this.authService.getCareerId();

    if (carreraId) {
      this.idCarreraActual = carreraId;

      this.reportService.getNombreCarrera(carreraId).subscribe({
        next: (nombre) => {
          this.nombreCarreraActual = nombre;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener el nombre de la carrera:', err);
          this.nombreCarreraActual = 'Carrera No Identificada';
        }
      });

      this.cargarFiltros();
      this.cargarDatosReporte();
    }
  }

  cargarFiltros(): void {
    this.reportService.getPeriodos().subscribe(data => {
      this.listadoPeriodos = data;
      this.cdr.detectChanges();
    });

    this.reportService.getEstados().subscribe(data => {
      this.listadoEstados = data;
      this.cdr.detectChanges();
    });

    this.reportService.getDocentesReporte(this.idCarreraActual, 0).subscribe(data => {
      this.listadoDocentes = data;
      this.cdr.detectChanges();
    });
  }

  cargarDatosReporte(): void {
    const periodo = this.filtroPeriodo !== 0 ? this.filtroPeriodo : undefined;

    this.reportService.getEstadisticas(this.idCarreraActual, periodo).subscribe(data => {
      if (data) this.estadisticas = data;
      this.cdr.detectChanges();
    });

    this.reportService.getDocentesReporte(this.idCarreraActual, periodo).subscribe(data => {
      this.docentesTable = data;
      this.cdr.detectChanges();
    });

    const estadoF = this.filtroEstado !== '' ? this.filtroEstado : undefined;
    const directorF = this.filtroDirector !== 0 ? this.filtroDirector : undefined;

    this.reportService.getEstudiantesReporte(
      this.idCarreraActual,
      periodo,
      estadoF,
      directorF
    ).subscribe(data => {
      this.estudiantesTable = data;
      this.cdr.detectChanges();
    });
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();
    const hora = new Date().toLocaleTimeString();

    doc.setFontSize(18);
    doc.setTextColor(46, 125, 50); // Verde oscuro
    doc.text('SGTIC - REPORTE ESTADÍSTICO', 105, 20, { align: 'center' });
    doc.setDrawColor(46, 125, 50);
    doc.line(14, 25, 196, 25);
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text(`Carrera:`, 14, 35);
    doc.setFont("helvetica", "normal");
    doc.text(`${this.nombreCarreraActual}`, 35, 35);
    doc.setFont("helvetica", "bold");
    doc.text(`Generado:`, 14, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`${fecha} a las ${hora}`, 35, 42);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumen de Gestión de Temas', 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Aprobados', 'Pendientes', 'Rechazados', 'B. Temas', 'P. Estudiante', 'Total']],
      body: [[
        this.estadisticas.temasAprobados,
        this.estadisticas.temasPendientes,
        this.estadisticas.temasRechazados,
        this.estadisticas.temasBanco,
        this.estadisticas.temasPropuesta,
        this.estadisticas.totalTemas
      ]],
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50], halign: 'center' },
      styles: { halign: 'center' }
    });

    let actualY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Carga Académica de Docentes', 14, actualY);

    autoTable(doc, {
      startY: actualY + 5,
      head: [['Docente', 'Especialización', 'Proyectos']],
      body: this.docentesTable.map(d => [
        d.nombreCompleto,
        d.especializacionPrincipal || 'N/A',
        d.proyectosAsignados
      ]),
      headStyles: { fillColor: [46, 125, 50] },
      styles: { fontSize: 9 }
    });

    actualY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Detalle de Estudiantes en Proceso', 14, actualY);

    autoTable(doc, {
      startY: actualY + 5,
      head: [['Estudiante', 'Tema', 'Director', 'Estado']],
      body: this.estudiantesTable.map(e => [
        e.nombreCompleto || 'N/A',
        e.tituloTema || 'Sin Título',
        e.nombreDirector || 'Sin asignar',
        (e.estado || 'Pendiente').toUpperCase()
      ]),
      headStyles: { fillColor: [33, 150, 243] },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { cellWidth: 80 }
      }
    });

    const pages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Página ${i} de ${pages}`, 105, 285, { align: 'center' });
    }

    const fileName = `Reporte_${this.nombreCarreraActual.replace(/\s+/g, '_')}_${fecha.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }
}
