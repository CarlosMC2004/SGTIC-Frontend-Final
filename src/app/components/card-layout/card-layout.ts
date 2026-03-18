import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-layout.html',
  styleUrls: ['./card-layout.css']
})
export class CardLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
