import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SalaryTrendChartComponent } from './components/salary-trend-chart.component';
import { DistributionChartsComponent } from './components/distribution-charts.component';
import { TechFrequencyChartComponent } from './components/tech-frequency-chart.component';
import { OverviewStatsComponent } from './components/overview-stats.component';
import { CompanyOffersChartsComponent } from './components/companyoffers-charts.component';
import { CompanyStackedChartComponent } from './components/company-stacked-chart.component';
import { CompanyDrawerComponent } from './components/company-drawer.component';
import {
  LocationOfferDto,
  SalaryOfferDto,
  TechnologyDto,
  CategoryDto,
  CompanyOffersDTO,
  OffersOverviewDto,
  CompanyDetailsData
} from '../../core/models/market-api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SalaryTrendChartComponent,
    DistributionChartsComponent,
    TechFrequencyChartComponent,
    OverviewStatsComponent,
    CompanyOffersChartsComponent,
    CompanyStackedChartComponent,
    CompanyDrawerComponent
  ],
  template: `
    <div class="dashboard-page min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      <!-- NOWY, OSTYLOWANY PASEK NAWIGACYJNY -->
      <nav class="app-navbar">
        <div class="navbar-container">
          
          <!-- LEWA STRONA: Logo + Linki -->
          <div class="navbar-left">
            <a routerLink="/" class="navbar-brand">
              Junior IT <span class="brand-accent">Analytics</span>
            </a>

            <div class="navbar-links">
              <a routerLink="/" 
                 routerLinkActive="active" 
                 [routerLinkActiveOptions]="{ exact: true }"
                 class="nav-item">
                Dashboard
              </a>
              <a routerLink="/about" 
                 routerLinkActive="active" 
                 class="nav-item">
                O projekcie
              </a>
            </div>
          </div>

          <!-- PRAWA STRONA: Przełącznik motywu -->
          <button type="button" 
                  (click)="themeService.toggleTheme()" 
                  class="theme-toggle-btn"
                  title="Przełącz motyw">
            <span class="theme-icon">🌓</span>
            <span class="theme-label">Tryb ciemny / jasny</span>
          </button>

        </div>
      </nav>

      <!-- GŁÓWNY KONTENER DASHBOARDU -->
      <main class="max-w-[1440px] mx-auto px-6 py-8 pb-24">
        
        <!-- Karta informacyjna (Hero) -->
        <div class="w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8" style="margin-bottom:2rem">
          <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Analiza Rynku Ofert Pracy IT
          </h1>
          <p class="text-md text-slate-400 dark:text-slate-400 leading-relaxed max-w-3xl">
            Serwis agreguje ogłoszenia rynku pracy IT w Polsce dla juniorów w wielu kategoriach rynku (programowanie, data science, QA itd.). Dane są pobierane z Pracuj.pl i theProtocol.it, aktualizowane codziennie i prezentują aktualny stan rynku pracy. Więcej informacji o projekcie i metodach agregacji danych znajdziesz w zakładce <a routerLink="/about" class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">O projekcie</a>.
          </p>
        </div>

        <!-- Stan ładowania głównych danych -->
        <div *ngIf="isLoading()" class="text-center py-16 text-slate-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-3"></div>
          <p class="text-sm">Pobieranie danych z bazy ofert...</p>
        </div>

        <!-- Sekcje analityczne po załadowaniu -->
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

          <!-- Skumulowany wykres pracodawców z podpiętą obsługą kliknięcia -->
          <div class="w-full">
            <app-company-stacked-chart 
              [data]="companyLocationsData"
              (companySelected)="onSelectCompany($event)">
            </app-company-stacked-chart>
          </div>

        </div>

        <!-- Szuflada boczna (Slide-over drawer) pobierająca szczegóły pracodawcy po kliknięciu -->
        <app-company-drawer
          [isOpen]="isDrawerOpen"
          [companyName]="selectedCompanyName"
          [isLoading]="isDrawerLoading"
          [details]="companyDetails"
          (closed)="onCloseDrawer()">
        </app-company-drawer>

      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  themeService = inject(ThemeService);
  private analyticsService = inject(AnalyticsService);

  // Flagi stanu ładowania dashboardu
  isLoading = signal<boolean>(true);

  // Dane wykresów głównych
  locations: LocationOfferDto[] = [];
  salaries: SalaryOfferDto[] = [];
  technologies: TechnologyDto[] = [];
  categories: CategoryDto[] = [];
  overviewData: OffersOverviewDto | null = null;
  companyOffers: CompanyOffersDTO[] = [];
  companyLocationsData: Record<string, Record<string, number>> | null = null;

  // Stan szuflady szczegółów firmy (Drawer)
  isDrawerOpen = false;
  selectedCompanyName: string | null = null;
  isDrawerLoading = false;
  companyDetails: CompanyDetailsData | null = null;

  ngOnInit(): void {
    // 1. Pobieranie mapy lokalizacji firm dla wykresu skumulowanego
    this.analyticsService.getCompanyLocationOffersMap().subscribe({
      next: (data) => this.companyLocationsData = data,
      error: (err) => console.error('Błąd pobierania mapy lokalizacji pracodawców:', err)
    });

    // 2. Pobieranie listy ofert per firma dla standardowego wykresu
    this.analyticsService.getCompanyOffers().subscribe({
      next: (data) => this.companyOffers = data,
      error: (err) => console.error('Błąd pobierania ogólnych ofert firm:', err)
    });

    // 3. Pobieranie kafelków podsumowujących (Overview)
    this.analyticsService.getOverview().subscribe({
      next: (data) => this.overviewData = data,
      error: (err) => console.error('Błąd pobierania overview:', err)
    });

    // 4. Pobieranie zestawu głównych danych analitycznych
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.locations = data.locations;
        this.salaries = data.salaries;
        this.technologies = data.technologies;
        this.categories = data.categories;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania danych dashboardu:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Obsługa kliknięcia w słupek na wykresie firm
  onSelectCompany(company: string): void {
    this.selectedCompanyName = company;
    this.isDrawerOpen = true;
    this.isDrawerLoading = true;
    this.companyDetails = null;
    
    // Wymuszenie natychmiastowego otwarcia szuflady ze spinnerem
    this.cdr.detectChanges();

    this.analyticsService.getCompanyFullDetails(company).subscribe({
      next: (data) => {
        this.companyDetails = data;
        this.isDrawerLoading = false;
        
        // Wymuszenie natychmiastowego wyrenderowania pobranych danych w szufladzie
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania danych firmy:', err);
        this.isDrawerLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCloseDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedCompanyName = null;
    this.companyDetails = null;
    this.cdr.detectChanges();
  }
}