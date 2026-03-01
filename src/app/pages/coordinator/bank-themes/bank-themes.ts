import { Component } from '@angular/core';
import {SidebarComponent} from '../../../components/sidebar/sidebar';
import {HeaderComponent} from '../../../components/header/header';
import {CommonModule} from '@angular/common';
import {ModalNewTheme} from '../../../components/modal-new-theme/modal-new-theme';

@Component({
  selector: 'app-bank-themes',
  imports: [SidebarComponent, HeaderComponent, ModalNewTheme, CommonModule],
  templateUrl: './bank-themes.html',
  styleUrl: './bank-themes.css',
})
export class BankThemes {
  showModal = false;
  abrirModal() {
    this.showModal = true;
  }
  cerrarModal() {
    this.showModal = false;
  }
}
