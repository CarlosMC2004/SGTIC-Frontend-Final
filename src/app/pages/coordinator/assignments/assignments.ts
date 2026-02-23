import { Component } from '@angular/core';
import {SidebarComponent} from '../../../components/sidebar/sidebar';
import {HeaderComponent} from '../../../components/header/header';

@Component({
  selector: 'app-assignments',
  imports: [
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class Assignments {

}
