import { 
  Component, 
  Input, 
  OnChanges, 
  OnInit, 
  SimpleChanges, 
  ViewChild, 
  Output, 
  EventEmitter, 
  inject, 
  ElementRef, 
  HostListener 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CompanyLocationOffersMap } from '../../../core/models/market-api.models';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-company-stacked-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      
      <!-- Nagłówek i kontrolki (Wyszukiwarka + Slider) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
            Pracodawcy: Rozkład Geograficzny Ofert
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-2">
            Skumulowana liczba ogłoszeń per pracodawca z podziałem na miasta i pracę zdalną.
          </p>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <span class="text-xs">👆</span> Kliknij słupek, aby zobaczyć szczegóły firmy
          </span>
        </div>

        <!-- Pasek akcji: Wyszukiwarka + Slider -->
        <div class="flex flex-wrap items-center gap-3">
          
          <!-- Kontener Wyszukiwarki z Autocomplete -->
          <div class="relative min-w-[280px] sm:min-w-[340px]">
            <div class="relative flex items-center">
              <span class="absolute left-3.5 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">🔍</span>
              
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (focus)="onSearchFocus()"
                placeholder="Szukaj firmy (np. Comarch)..."
                class="w-full pl-10 pr-9 py-2.5 text-sm font-medium rounded-xl 
                       bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white 
                       placeholder-slate-500 dark:placeholder-slate-400 
                       border border-slate-300 dark:border-slate-600 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                       shadow-inner transition-all"
              />

              <!-- Przycisk wyczyszczenia filtra -->
              <button
                *ngIf="searchQuery"
                type="button"
                (click)="clearSearch()"
                class="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Wyczyść wyszukiwanie">
                ✕
              </button>
            </div>

            <!-- Rozwijana lista podpowiedzi firm -->
            <div *ngIf="isDropdownOpen && suggestions.length > 0" 
                 class="absolute left-0 right-0 top-full mt-1.5 bg-[#0b1120] border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50">
              <div class="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-800">
                Podpowiedzi firm ({{ suggestions.length }})
              </div>
              <ul class="divide-y divide-slate-800/60 m-0 p-0 list-none">
                <li 
                  *ngFor="let item of suggestions"
                  (click)="selectSuggestion(item)"
                  class="px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 cursor-pointer flex items-center justify-between transition-colors">
                  <span class="truncate font-medium">{{ item }}</span>
                  <span class="text-[10px] text-indigo-400 font-mono ml-2">Wybierz &rarr;</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Slider (widoczny tylko gdy nie ma aktywnego wyszukiwania i jest > 5 firm) -->
          <div *ngIf="!searchQuery && totalCompaniesCount > 5" 
               class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <label for="stackedSlider" class="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Top: <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm">{{ displayLimit }}</span> firm
            </label>
            <input 
              id="stackedSlider"
              type="range"
              [min]="5"
              [max]="maxLimit"
              [step]="1"
              [(ngModel)]="displayLimit"
              (ngModelChange)="onSliderChange()"
              class="w-24 sm:w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      <!-- Obszar wykresu ze skalowalną wysokością -->
      <div 
        class="chart-container" 
        *ngIf="filteredCompaniesCount > 0"
        [style.height.px]="calculatedChartHeight">
        <canvas baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="'bar'">
        </canvas>
      </div>

      <!-- Komunikat braku wyników wyszukiwania -->
      <div *ngIf="searchQuery && filteredCompaniesCount === 0" class="text-center py-12 text-slate-400 text-sm">
        Nie znaleziono firmy pasującej do frazy: <strong class="text-slate-200">"{{ searchQuery }}"</strong>.
      </div>

      <!-- Komunikat braku danych z bazy -->
      <div *ngIf="!searchQuery && totalCompaniesCount === 0" class="text-center py-8 text-slate-400 text-sm">
        Brak danych o lokalizacjach pracodawców w wybranym okresie.
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .chart-container {
      position: relative;
      width: 100%;
      transition: height 0.25s ease-out;
    }
    ul::-webkit-scrollbar {
      width: 4px;
    }
    ul::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
  `]
})
export class CompanyStackedChartComponent implements OnInit, OnChanges {
  private analyticsService = inject(AnalyticsService);
  private elementRef = inject(ElementRef);

  @Input() data: CompanyLocationOffersMap | null = null;
  @Output() companySelected = new EventEmitter<string>();
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  searchQuery = '';
  displayLimit = 10;
  maxLimit = 250;
  filteredCompaniesCount = 0;

  allCompanyNames: string[] = [];
  suggestions: string[] = [];
  isDropdownOpen = false;

  private cityPalette: Record<string, string> = {
    'Remote': '#10b981',
    'Zdalnie': '#10b981',
    'Warszawa': '#6366f1',
    'Kraków': '#3b82f6',
    'Wrocław': '#06b6d4',
    'Gdańsk': '#8b5cf6',
    'Poznań': '#f59e0b',
    'Katowice': '#ec4899',
    'Łódź': '#14b8a6',
    'Lublin': '#f97316'
  };

  private defaultColors: string[] = [
    '#64748b', '#a855f7', '#0ea5e9', '#84cc16', '#eab308', '#d946ef', '#6b7280'
  ];

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    onHover: (event, chartElement) => {
      const target = event.native?.target as HTMLElement | null;
      if (target) {
        target.style.cursor = chartElement.length ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (context) => {
            const location = context.dataset.label || 'Nieznana lokalizacja';
            const offersCount = (context.parsed as { x?: number })?.x ?? 0;
            if (offersCount === 0) return '';
            return ` Lokalizacja: ${location} — ${offersCount} ofert`;
          },
          afterBody: () => '\n💡 Kliknij słupek, aby zobaczyć szczegóły'
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: '#f8fafc',
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const companyName = this.chartData.labels?.[index] as string;
        if (companyName) {
          this.companySelected.emit(companyName);
        }
      }
    }
  };

  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  ngOnInit(): void {
    this.analyticsService.getCompanies().subscribe({
      next: (companies) => {
        this.allCompanyNames = Array.isArray(companies) ? companies.sort() : [];
      },
      error: (err) => console.error('Błąd podczas pobierania listy firm:', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.maxLimit = Math.min(this.totalCompaniesCount, 250);
      if (this.displayLimit > this.maxLimit) {
        this.displayLimit = Math.max(5, this.maxLimit);
      }
      this.updateChart();
    }
  }

  get totalCompaniesCount(): number {
    return this.data ? Object.keys(this.data).length : 0;
  }

  get calculatedChartHeight(): number {
    const rowHeight = 42;
    const basePadding = 90;
    const count = this.filteredCompaniesCount || 1;
    return Math.max(180, count * rowHeight + basePadding);
  }

  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.suggestions = [];
      this.isDropdownOpen = false;
    } else {
      this.suggestions = this.allCompanyNames
        .filter(name => name.toLowerCase().includes(query))
        .slice(0, 10);
      this.isDropdownOpen = this.suggestions.length > 0;
    }

    this.updateChart();
  }

  onSearchFocus(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.onSearchInput();
    }
  }

  selectSuggestion(company: string): void {
    this.searchQuery = company;
    this.isDropdownOpen = false;
    this.updateChart();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.isDropdownOpen = false;
    this.updateChart();
  }

  onSliderChange(): void {
    this.updateChart();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.isDropdownOpen = false;
  }

  private updateChart(): void {
    if (!this.data) return;

    const allCompanies = Object.entries(this.data).map(([company, locations]) => {
      const total = Object.values(locations).reduce((sum, val) => sum + val, 0);
      return { company, locations, total };
    });

    let selectedCompanies: { company: string; locations: Record<string, number>; total: number }[];
    const query = this.searchQuery.trim().toLowerCase();

    if (query) {
      selectedCompanies = allCompanies
        .filter(c => c.company.toLowerCase().includes(query))
        .sort((a, b) => b.total - a.total);
    } else {
      selectedCompanies = allCompanies
        .sort((a, b) => b.total - a.total)
        .slice(0, this.displayLimit);
    }

    this.filteredCompaniesCount = selectedCompanies.length;

    if (this.filteredCompaniesCount === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const labels = selectedCompanies.map(c => c.company);

    const citiesSet = new Set<string>();
    selectedCompanies.forEach(c => {
      Object.keys(c.locations).forEach(city => citiesSet.add(city));
    });
    const cities = Array.from(citiesSet);

    let colorIdx = 0;
    const datasets = cities.map(city => {
      const color = this.cityPalette[city] || this.defaultColors[colorIdx++ % this.defaultColors.length];

      return {
        label: city,
        data: selectedCompanies.map(c => c.locations[city] || 0),
        backgroundColor: color,
        borderRadius: 3,
        barThickness: selectedCompanies.length === 1 ? 28 : 22,
        maxBarThickness: 30
      };
    });

    this.chartData = { labels, datasets };

    setTimeout(() => {
      this.chart?.chart?.resize();
      this.chart?.update();
    }, 50);
  }
}