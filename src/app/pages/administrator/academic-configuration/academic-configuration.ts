import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SidebarComponent} from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';

@Component({
  selector: 'app-academic-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './academic-configuration.html',
  styleUrl: './academic-configuration.css',
})
export class AcademicConfiguration {

  activeTab: string = 'degrees';
  degreeOptions = [
    {
      id: 1,
      title: 'Research Project',
      subtitle: 'ACADEMIC RESEARCH',
      icon: 'science',
      active: true
    },
    {
      id: 2,
      title: 'Degree Exam',
      subtitle: 'KNOWLEDGE VALIDATION',
      icon: 'assignment_turned_in',
      active: true
    },
    {
      id: 3,
      title: 'Thesis',
      subtitle: 'WRITTEN DISSERTATION',
      icon: 'history_edu',
      active: false
    }
  ];

  knowledgeAreas = [
    'Artificial Intelligence',
    'Database Systems',
    'Cybersecurity',
    'Software Engineering',
    'Networks & Telecommunications',
    'Machine Learning'
  ];

  newAreaName: string = '';
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  removeArea(area: string) {
    this.knowledgeAreas = this.knowledgeAreas.filter(a => a !== area);
  }
}
