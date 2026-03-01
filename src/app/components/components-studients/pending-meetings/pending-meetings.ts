import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-meetings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-meetings.html',
  styleUrls: ['./pending-meetings.css']
})
export class PendingMeetingsComponent {
  @Input() meetings: any[] = [];
}