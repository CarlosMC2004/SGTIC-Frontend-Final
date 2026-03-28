import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Topbar } from '../../../components/top-bar/top-bar';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { StatisticsReport } from '../../../services/statistics-report/statistics-report';
import { AuthService } from '../../../services/auth.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [Topbar, SidebarComponent, CommonModule, FormsModule],
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
    const colorVerdeUTEQ: [number, number, number] = [22, 101, 52];
    const colorGris: [number, number, number] = [80, 80, 80];
    const dibujarPDF = (logoImg?: HTMLImageElement, chartImgUrl?: string, chartHeight?: number) => {

      if (logoImg) {
        doc.addImage(logoImg, 'PNG', 14, 10, 22, 22);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(colorVerdeUTEQ[0], colorVerdeUTEQ[1], colorVerdeUTEQ[2]);
      doc.text('UNIVERSIDAD TÉCNICA ESTATAL DE QUEVEDO', 115, 20, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(colorGris[0], colorGris[1], colorGris[2]);
      doc.text('SGTIC - Sistema de Gestión de Trabajos Curriculares', 115, 27, { align: 'center' });
      doc.setDrawColor(colorVerdeUTEQ[0], colorVerdeUTEQ[1], colorVerdeUTEQ[2]);
      doc.setLineWidth(0.6);
      doc.line(14, 35, 196, 35);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text('Reporte:', 14, 43);
      doc.setFont("helvetica", "normal");
      doc.text('Estadísticas de Titulación', 32, 43);
      doc.setFont("helvetica", "bold");
      doc.text('Carrera:', 14, 49);
      doc.setFont("helvetica", "normal");
      doc.text(`${this.nombreCarreraActual}`, 32, 49);
      doc.setFont("helvetica", "bold");
      doc.text('Generado:', 140, 43);
      doc.setFont("helvetica", "normal");
      doc.text(`${fecha} - ${hora}`, 160, 43);

      let actualY = 58;

      if (chartImgUrl && chartHeight) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(colorVerdeUTEQ[0], colorVerdeUTEQ[1], colorVerdeUTEQ[2]);
        doc.text('Gráfica de Origen de Temas', 105, actualY, { align: 'center' });
        doc.addImage(chartImgUrl, 'PNG', 45, actualY + 4, 120, chartHeight);
        actualY += chartHeight + 15;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(colorVerdeUTEQ[0], colorVerdeUTEQ[1], colorVerdeUTEQ[2]);
      doc.text('Resumen de Gestión de Temas', 14, actualY);

      autoTable(doc, {
        startY: actualY + 4,
        head: [['Aprobados', 'Pendientes', 'Rechazados', 'B. Temas', 'P. Estudiante', 'Total']],
        body: [[
          this.estadisticas.temasAprobados,
          this.estadisticas.temasPendientes,
          this.estadisticas.temasRechazados,
          this.estadisticas.temasBanco,
          this.estadisticas.temasPropuesta,
          this.estadisticas.totalTemas
        ]],
        theme: 'striped',
        headStyles: { fillColor: colorVerdeUTEQ, textColor: [255, 255, 255], halign: 'center', fontStyle: 'bold' },
        bodyStyles: { halign: 'center', textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [245, 248, 245] }
      });

      actualY = (doc as any).lastAutoTable.finalY + 15;

      if (this.docentesTable && this.docentesTable.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(colorVerdeUTEQ[0], colorVerdeUTEQ[1], colorVerdeUTEQ[2]);
        doc.text('Carga Académica de Docentes', 14, actualY);

        autoTable(doc, {
          startY: actualY + 4,
          head: [['Docente', 'Especialización', 'Proyectos']],
          body: this.docentesTable.map(d => [
            d.nombreCompleto,
            d.especializacion || 'N/A',
            d.proyectosAsignados
          ]),
          theme: 'striped',
          headStyles: { fillColor: colorVerdeUTEQ, textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { textColor: [50, 50, 50] },
          alternateRowStyles: { fillColor: [245, 248, 245] },
          columnStyles: { 2: { halign: 'center' } }
        });
        actualY = (doc as any).lastAutoTable.finalY + 15;
      }

      if (this.estudiantesTable && this.estudiantesTable.length > 0) {
        if (actualY > 240) {
          doc.addPage();
          actualY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(colorVerdeUTEQ[0], colorVerdeUTEQ[1], colorVerdeUTEQ[2]);
        doc.text('Detalle de Estudiantes en Proceso', 14, actualY);

        autoTable(doc, {
          startY: actualY + 4,
          head: [['Estudiante', 'Tema', 'Director', 'Estado']],
          body: this.estudiantesTable.map(e => [
            e.nombreCompleto || 'N/A',
            e.tituloTema || 'Sin Título',
            e.nombreDirector || 'Sin asignar',
            (e.estado || 'Pendiente').toUpperCase()
          ]),
          theme: 'striped',
          headStyles: { fillColor: colorVerdeUTEQ, textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { textColor: [50, 50, 50] },
          alternateRowStyles: { fillColor: [245, 248, 245] },
          columnStyles: { 1: { cellWidth: 75 } }
        });
      }

      const pages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(14, 282, 196, 282);
        doc.text(`Página ${i} de ${pages}`, 105, 288, { align: 'center' });
      }

      const fileName = `Reporte_${this.nombreCarreraActual.replace(/\s+/g, '_')}_${fecha.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    };

    const procesarLogoYPDF = (chartImgUrl?: string, chartHeight?: number) => {
      const logo = new Image();
      logo.src = 'logo_uteq.png';

      logo.onload = () => dibujarPDF(logo, chartImgUrl, chartHeight);
      logo.onerror = () => {
        console.warn('No se pudo cargar el logo.');
        dibujarPDF(undefined, chartImgUrl, chartHeight);
      };
    };

    const chartElement = document.getElementById('donutChart');
    if (chartElement) {
      html2canvas(chartElement, { scale: 2 }).then(canvas => {
        const imgWidth = 120;
        const ratio = canvas.height / canvas.width;
        const imgHeight = imgWidth * ratio;
        const chartImgData = canvas.toDataURL('image/png');
        procesarLogoYPDF(chartImgData, imgHeight);
      }).catch(err => {
        console.error("Error al capturar la dona:", err);
        procesarLogoYPDF();
      });
    } else {
      procesarLogoYPDF();
    }
  }
}
