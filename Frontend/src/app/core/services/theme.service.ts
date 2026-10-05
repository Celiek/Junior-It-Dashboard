import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  toggleTheme(): void {
    this.isDarkMode.update(dark => !dark);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getChartColors() {
    return {
      text: this.isDarkMode() ? '#94a3b8' : '#64748b',
      grid: this.isDarkMode() ? '#1e293b' : '#f1f5f9'
    };
  }
}