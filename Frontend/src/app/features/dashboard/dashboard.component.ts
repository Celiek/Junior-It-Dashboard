import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SalaryTrendChartComponent } from './components/salary-trend-chart.component';
import { DistributionChartsComponent } from './components/distribution-charts.component';
import { TechFrequencyChartComponent } from './components/tech-frequency-chart.component';
import {OverviewStatsComponent} from './components/overview-stats.component';
import {CompanyOffersChartsComponent} from './components/companyoffers-charts.component';
import {OffersOverviewDto} from '../../core/models/market-api.models';
import { LocationOfferDto, SalaryOfferDto, TechnologyDto, CategoryDto,CompanyOffersDTO } from '../../core/models/market-api.models';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SalaryTrendChartComponent,
    DistributionChartsComponent,
    TechFrequencyChartComponent,
    OverviewStatsComponent,
    CompanyOffersChartsComponent,
    RouterModule, 
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <nav class="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-20">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between" style="display: flex; align-items: center; justify-content: space-between;">
          
          <!-- LEWA STRONA: Logo + Linki -->
          <div style="display: flex; align-items: center; gap: 2rem;">
            <a routerLink="/" style="font-size: 1.15rem; font-weight: 700; color: #f8fafc; text-decoration: none; cursor: pointer;">
              Junior IT <span style="color: #6366f1;">Analytics</span>
            </a>

            <!-- Kontener zakładek -->
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <a routerLink="/" 
                style="font-size: 1rem; font-weight: 600; color: #818cf8; text-decoration: none; cursor: pointer;">
                Dashboard
              </a>
              <a routerLink="/about" 
                style="font-size: 1rem; font-weight: 500; color: #cbd5e1; text-decoration: none; cursor: pointer;">
                O projekcie
              </a>
            </div>
          </div>

          <!-- PRAWA STRONA: Przycisk motywu -->
          <button (click)="themeService.toggleTheme()" 
                  class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  style="cursor: pointer;">
            Przełącz tryb ciemny/jasny
          </button>

        </div>
      </nav>

      <!-- GŁÓWNY KONTENER: Wymuszone pełne rozciągnięcie i pionowy układ -->
      <main class="max-w-6xl mx-auto px-4 py-8 pb-24">
        <!-- Karta informacyjna / Hero header -->
            <div class="w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Analiza Rynku Ofert Pracy IT
            </h1>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                Serwis agreguje ogłoszenia rynku pracy It w polsce dla juniorów w wielu kategoriach rynku (programowanie, data science, QA itd.). Dane sa pobierane z Pracuj.pl i theProtocol.it. Dane są aktualizowane codziennie o godzinie 12 i prezentują aktualny stan rynku pracy w Polsce. Wykresy przedstawiają trendy zarobków, popularność technologii oraz dystrybucję ofert według kategorii i lokalizacji.
                Więcej wykresów i wskaźników znajduje się w zakładce więcej, metody analizy i sposób pozyskiwania danych opisane są w zakładce o projekcie.
            </p>
            </div>
        <!-- Stan ładowania -->
        <div *ngIf="isLoading()" class="text-center py-12 text-slate-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-2"></div>
          <p>Pobieranie danych z bazy ofert...</p>
        </div>

        <!-- Sekcje ułożone jedna pod drugą w pełnej szerokości -->
        <div *ngIf="!isLoading()" class="w-full flex flex-col gap-10">
          
            <div class="w-full">
              <app-overview-stats [overview]="overviewData"></app-overview-stats>
            </div>
          <div class="w-full">
            <app-salary-trend-chart [rawSalaries]="salaries"></app-salary-trend-chart>
          </div>

          <div class="w-full">
            <app-tech-frequency-chart [technologies]="technologies"></app-tech-frequency-chart>
          </div>

          <div class="w-full">
            <app-distribution-charts [categories]="categories" [locations]="locations"></app-distribution-charts>
          </div>
          <div class="w-full">
            <app-companyoffers-charts [companyOffers]="companyOffers"></app-companyoffers-charts>
          </div>
        </div>
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
  overviewData: OffersOverviewDto | null = null;
  companyOffers: CompanyOffersDTO[] = [];


  ngOnInit(): void {
    this.analyticsService.getCompanyOffers().subscribe({
      next: (data) => this.companyOffers = data,
      error: (err) => console.error('Błąd pobierania danych company offers:', err)
    });

    this.analyticsService.getOverview().subscribe({
      next: (data) => this.overviewData = data,
      error: (err) => console.error('Błąd pobierania danych overview:', err)
    })

    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.locations = data.locations;
        this.salaries = data.salaries;
        this.technologies = data.technologies;
        this.categories = data.categories;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania danych:', err);
        this.isLoading.set(false);
      }
    });
  }
}