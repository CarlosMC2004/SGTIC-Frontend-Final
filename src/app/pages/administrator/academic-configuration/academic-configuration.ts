import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SidebarComponent} from '../../../components/sidebar/sidebar';
import { HeaderComponent } from '../../../components/header/header';
import {ModalNewModalityComponent} from '../../../components/modal-new-modality/modal-new-modality';
import { ModalAddAreaComponent } from '../../../components/modal-add-area/modal-add-area';

@Component({
  selector: 'app-academic-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalNewModalityComponent, ModalAddAreaComponent],
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


  isModalOpen: boolean = false;
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveNewModality(data: { name: string, status: boolean }) {
    this.degreeOptions.push({
      id: Date.now(),
      title: data.name,
      subtitle: 'CUSTOM MODALITY',
      icon: 'extension',
      active: data.status
    });
    this.closeModal();
  }


  isAreaModalOpen: boolean = false;
  openAreaModal() {
    this.isAreaModalOpen = true;
  }

  closeAreaModal() {
    this.isAreaModalOpen = false;
  }

  saveNewArea(newArea: string) {
    if (!this.knowledgeAreas.includes(newArea)) {
      this.knowledgeAreas.push(newArea);
    }
    this.closeAreaModal();
  }
}
