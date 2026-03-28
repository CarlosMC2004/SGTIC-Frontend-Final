import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upcoming-deliveries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upcoming-deliveries.html',
  styleUrls: ['./upcoming-deliveries.css']
})
export class UpcomingDeliveriesComponent {
  @Input() deliveries: any[] = [];
}