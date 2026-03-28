import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { Topbar } from '../../../components/top-bar/top-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, Topbar],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
  encapsulation: ViewEncapsulation.None // ← agrega esto
})
export class AdminLayoutComponent implements OnInit {
  userRole: 'coordinador' | 'estudiante' | 'admin' = 'admin';
  userName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        if (user.roles.includes('administrador_sgtic')) {
          this.userRole = 'admin';
        } else if (user.roles.includes('coordinador_facultad') || user.roles.includes('coordinador_carrera')) {
          this.userRole = 'coordinador';
        } else if (user.roles.includes('estudiante')) {
          this.userRole = 'estudiante';
        }
        this.userName = user.fullName;
      }
    });
  }
}