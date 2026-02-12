import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-card.html',
  styleUrls: ['./status-card.css']
})
export class StatusCardComponent {
  @Input() title = '';
  @Input() count = 0;
  @Input() icon = '';
  @Input() colorType: 'blue' | 'green' | 'red' = 'blue';
}
