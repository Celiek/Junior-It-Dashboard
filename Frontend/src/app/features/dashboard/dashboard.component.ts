import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SalaryTrendChartComponent } from './components/salary-trend-chart.component';
import { DistributionChartsComponent } from './components/distribution-charts.component';
import { TechFrequencyChartComponent } from './components/tech-frequency-chart.component';
import { LocationOfferDto, SalaryOfferDto, TechnologyDto, CategoryDto } from '../../core/models/market-api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SalaryTrendChartComponent,
    DistributionChartsComponent,
    TechFrequencyChartComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <nav class="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-20">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="font-bold text-lg">Junior IT <span class="text-indigo-600">Analytics</span></div>
          <button (click)="themeService.toggleTheme()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800">
            Przełącz tryb
          </button>
        </div>
      </nav>

      <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <!-- Loader / Stan ładowania -->
        <div *ngIf="isLoading()" class="text-center py-12 text-slate-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-2"></div>
          <p>Pobieranie danych z bazy ofert...</p>
        </div>

        <ng-container *ngIf="!isLoading()">
          <!-- Wykres trendu płac -->
          <app-salary-trend-chart [rawSalaries]="salaries"></app-salary-trend-chart>

          <!-- Wykres technologii -->
          <app-tech-frequency-chart [technologies]="technologies"></app-tech-frequency-chart>

          <!-- Wykresy kategorii i lokalizacji -->
          <app-distribution-charts [categories]="categories" [locations]="locations"></app-distribution-charts>
        </ng-container>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  themeService = inject(ThemeService);
  private analyticsService = inject(AnalyticsService);

  isLoading = signal<boolean>(true);

  locations: LocationOfferDto[] = [];
  salaries: SalaryOfferDto[] = [];
  technologies: TechnologyDto[] = [];
  categories: CategoryDto[] = [];

  ngOnInit(): void {
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.locations = data.locations;
        this.salaries = data.salaries;
        this.technologies = data.technologies;
        this.categories = data.categories;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania danych z backendu:', err);
        this.isLoading.set(false);
      }
    });
  }
}