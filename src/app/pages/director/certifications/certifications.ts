import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';


export interface CertifiableWork {
  idWork: number;
  studentName: string;
  thesisTitle: string;
  status: string;
  compilatioPercentage: number | null;
  certificateUrl: string | null;
}

@Component({
  selector: 'app-director-certifications',
  standalone: true,
  imports: [CommonModule, SidebarComponent, Topbar],
  templateUrl: './certifications.html',
  styleUrls: ['./certifications.css']
})
export class CertificationsComponent implements OnInit {

  certifiableWorks: CertifiableWork[] = [];

  ngOnInit(): void {
    this.loadCertifiableWorks();
  }

  loadCertifiableWorks() {
    this.certifiableWorks = [];
  }

  openCertifyModal(work: CertifiableWork) {
  }
}
