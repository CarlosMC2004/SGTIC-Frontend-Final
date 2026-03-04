import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.css']
})
export class Topbar {
  isProfileMenuOpen = false;
  isPeriodMenuOpen = false;

  // Alternar menú de perfil
  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isPeriodMenuOpen = false; // Cierra el otro si está abierto
  }

  // Alternar menú de período
  togglePeriodMenu(event: Event) {
    event.stopPropagation();
    this.isPeriodMenuOpen = !this.isPeriodMenuOpen;
    this.isProfileMenuOpen = false; // Cierra el otro si está abierto
  }

  // Cierra los menús si se hace clic en cualquier otra parte de la pantalla
  @HostListener('document:click')
  closeMenus() {
    this.isProfileMenuOpen = false;
    this.isPeriodMenuOpen = false;
  }
}