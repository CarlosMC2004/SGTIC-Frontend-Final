import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private isDark = false;

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.enableDark();
    }
  }

  toggle() {
    this.isDark ? this.enableLight() : this.enableDark();
  }

  private enableDark() {
    this.isDark = true;
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }

  private enableLight() {
    this.isDark = false;
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  get darkMode(): boolean {
    return this.isDark;
  }
}