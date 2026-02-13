import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar'; // Ajusta la ruta según tu proyecto

interface Career {
  name: string;
}

interface Faculty {
  id: number;
  name: string;
  subtitle: string;
  icon: string; // Nombre del icono de Material Symbols
  iconBg: string; // Color de fondo suave para el icono
  iconColor: string; // Color del icono
  careersCount: number;
  careers: Career[];
}

@Component({
  selector: 'app-institutional-structure',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './institutional-structure.html',
  styleUrls: ['./institutional-structure.css']
})
export class InstitutionalStructureComponent {
  
  // Estadísticas superiores
  stats = [
    { title: 'Facultades Activas', value: '12', icon: 'school', color: 'text-green' },
    { title: 'Carreras Totales', value: '48', icon: 'book', color: 'text-green' },
    { title: 'Estudiantes Registrados', value: '4,250', icon: 'groups', color: 'text-dark' }
  ];

  // Datos de las tarjetas de facultades
  faculties: Faculty[] = [
    {
      id: 1,
      name: 'Ingeniería',
      subtitle: 'Facultad de Ciencias Aplicadas',
      icon: 'engineering',
      iconBg: '#e8f5e9',
      iconColor: '#2e7d32',
      careersCount: 8,
      careers: [
        { name: 'Ingeniería de Software' },
        { name: 'Ingeniería Civil' },
        { name: 'Ingeniería Industrial' }
      ]
    },
    {
      id: 2,
      name: 'Ciencias Sociales',
      subtitle: 'División de Humanidades',
      icon: 'groups',
      iconBg: '#f1f8e9',
      iconColor: '#558b2f',
      careersCount: 5,
      careers: [
        { name: 'Psicología Clínica' },
        { name: 'Sociología' },
        { name: 'Comunicación Social' }
      ]
    },
    {
      id: 3,
      name: 'Ciencias Médicas',
      subtitle: 'Escuela Superior de Medicina',
      icon: 'medical_services',
      iconBg: '#e0f2f1',
      iconColor: '#00695c',
      careersCount: 4,
      careers: [
        { name: 'Medicina General' },
        { name: 'Enfermería' },
        { name: 'Odontología' }
      ]
    },
    {
      id: 4,
      name: 'Artes y Humanidades',
      subtitle: 'Centro de Bellas Artes',
      icon: 'palette',
      iconBg: '#f9fbe7',
      iconColor: '#827717',
      careersCount: 6,
      careers: [
        { name: 'Artes Visuales' },
        { name: 'Diseño Gráfico' },
        { name: 'Filosofía' }
      ]
    }
  ];

  // Paginación simulada
  currentPage = 1;
  totalPages = 3;
}