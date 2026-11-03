import { Component, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CompanyLocationOffersMap } from '../../../core/models/market-api.models';

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
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Skumulowana liczba ogłoszeń per pracodawca z podziałem na miasta i pracę zdalną.
          </p>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <span class="text-xs">👆</span> Kliknij słupek, aby zobaczyć szczegóły firmy
            </span>
        </div>

        <!-- Pasek akcji: Wyszukiwarka + Slider -->
        <div class="flex flex-wrap items-center gap-3">
          
          <!-- Input Wyszukiwarki -->
          <div class="relative flex items-center min-w-[280px] sm:min-w-[340px]">
  <span class="absolute left-3.5 text-slate-400 dark:text-slate-300 text-sm pointer-events-none"></span>
  
        <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
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
            (click)="clearSearch()"
            class="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Wyczyść wyszukiwanie">
            ✕
        </button>
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
  `]
})
export class CompanyStackedChartComponent implements OnChanges {
  @Output() companySelected = new EventEmitter<string>();
  openCompanyDetails(companyName: string):void {
      this.companySelected.emit(companyName);
  }

  @Input() data: CompanyLocationOffersMap | null = null;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  searchQuery: string = '';
  displayLimit: number = 10;
  maxLimit: number = 250;
  filteredCompaniesCount: number = 0;

  get totalCompaniesCount(): number {
    return this.data ? Object.keys(this.data).length : 0;
  }

  // Dynamiczna wysokość dostosowująca się do 1 firmy lub N firm
  get calculatedChartHeight(): number {
    const rowHeight = 42;
    const basePadding = 90; // miejsce na legendę lokalizacji i oś X
    const count = this.filteredCompaniesCount || 1;
    return Math.max(180, count * rowHeight + basePadding);
  }

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
        display: false,
        position: 'top',
        labels: {
          color: '#cbd5e1',
          boxWidth: 12,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (context) => {
            const location = context.dataset.label || 'Nieznana lokalizacja';
            const offersCount = (context.parsed as { x?: number })?.x ?? 0;
            if (offersCount === 0) return '';
            return ` Lokalizacja: ${location} — ${offersCount} ofert`;
          }
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
    }
    ,
    onClick: (event, elements) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const companyName = this.chartData.labels?.[index] as string;
      if (companyName) {
        this.openCompanyDetails(companyName);
      }
    }
  }
  };

  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.maxLimit = Math.min(this.totalCompaniesCount, 250);
      if (this.displayLimit > this.maxLimit) {
        this.displayLimit = Math.max(5, this.maxLimit);
      }
      this.updateChart();
    }
  }

  onSearchChange(): void {
    this.updateChart();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.updateChart();
  }

  onSliderChange(): void {
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.data) return;

    // 1. Zliczanie łącznej liczby ofert dla każdej firmy
    const allCompanies = Object.entries(this.data).map(([company, locations]) => {
      const total = Object.values(locations).reduce((sum, val) => sum + val, 0);
      return { company, locations, total };
    });

    let selectedCompanies: { company: string; locations: Record<string, number>; total: number }[];

    // 2. Filtrowanie po wpisanej frazie vs pobranie Top N ze slidera
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

    // 3. Unikalne miasta obecne w wybranej grupie
    const citiesSet = new Set<string>();
    selectedCompanies.forEach(c => {
      Object.keys(c.locations).forEach(city => citiesSet.add(city));
    });
    const cities = Array.from(citiesSet);

    // 4. Budowa datasetów Chart.js
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