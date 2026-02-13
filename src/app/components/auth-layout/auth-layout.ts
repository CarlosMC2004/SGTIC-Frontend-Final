//import { Component } from '@angular/core';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css'
})

// export class AuthLayoutComponent {
//}
  //styleUrls: ['./auth-layout.css']
//})

export class AuthLayoutComponent {
  @Input() pageTitle: string = '';
  @Input() quote: string = '';
  @Input() author: string = '';
}

export class AuthLayout {
}
