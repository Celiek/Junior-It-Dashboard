import { Component, Input, OnChanges, SimpleChanges, signal, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { LocationOfferDto, CategoryDto } from '../../../core/models/market-api.models';

@Component({
  selector: 'app-distribution-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- 1. KATEGORIE (Bez slidera, bogata paleta barw) -->
      <div class="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div class="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-base mb-0.5">Oferty wg Kategorii</h3>
            <p class="text-xs text-slate-500">Podział rynku (kolumna <code>category</code>)</p>
          </div>

          <!-- Kontener z wykresem pączkowym -->
          <div class="relative h-80">
            <canvas baseChart [data]="categoryChartData" [options]="donutOptions" [type]="'doughnut'"></canvas>
          </div>
        </div>
      </div>

      <!-- 2. LOKALIZACJE (Slider zachowany) -->
      <div class="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 class="font-bold text-slate-800 dark:text-slate-100 text-base mb-0.5">Lokalizacja ofert</h3>
              <p class="text-xs text-slate-500">Wartości z <code>location</code> oraz <code>liczba_ofert</code></p>
            </div>

            <!-- Slider Lokalizacji -->
            <div class="flex items-center bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 select-none">
              <label for="locLimit" class="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap mr-4">
                Top: <span class="text-indigo-600 dark:text-indigo-400 font-bold ml-1 inline-block min-w-[16px] text-center">{{ currentLocationLimit() }}</span>
              </label>
              <input
                id="locLimit"
                type="range"
                [min]="3"
                [max]="maxLocationLimit()"
                [step]="1"
                [value]="currentLocationLimit()"
                (input)="onLocationLimitChange($event)"
                class="w-24 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 my-auto"
              />
            </div>
          </div>

          <!-- Dynamiczna wysokość zależna od wybranej liczby miast -->
          <div class="relative" [style.height.px]="locationContainerHeight">
            <canvas baseChart [data]="locationChartData" [options]="barOptions" [type]="'bar'"></canvas>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DistributionChartsComponent implements OnChanges {
  @Input() categories: CategoryDto[] = [];
  @Input() locations: LocationOfferDto[] = [];
  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  // Sygnały tylko dla slidera lokalizacji
  currentLocationLimit = signal<number>(8);
  maxLocationLimit = signal<number>(30);

  public categoryChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public locationChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // Paleta 24 wyselekcjonowanych, dobrze kontrastujących kolorów
  private extendedPalette: string[] = [
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
    '#84cc16', '#a855f7', '#0284c7', '#059669', '#d97706',
    '#dc2626', '#475569', '#6d28d9', '#be185d', '#0d9488',
    '#ea580c', '#65a30d', '#7c3aed', '#2563eb'
  ];

  public donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          color: '#94a3b8',
          font: { size: 11 }
        }
      }
    }
  };

  public barOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Liczba ofert: ${context.parsed.x}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#1e293b' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  };

  get locationContainerHeight(): number {
    return Math.max(260, this.currentLocationLimit() * 30);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categories'] && this.categories?.length) {
      this.updateCategoryChart();
    }

    if (changes['locations'] && this.locations?.length) {
      this.maxLocationLimit.set(Math.min(this.locations.length, 40));
      if (this.currentLocationLimit() > this.maxLocationLimit()) {
        this.currentLocationLimit.set(this.maxLocationLimit());
      }
      this.updateLocationChart();
    }
  }

  onLocationLimitChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.currentLocationLimit.set(val);
    this.updateLocationChart();
  }

  private updateCategoryChart(): void {
    if (!this.categories?.length) return;

    // Sortujemy malejąco, aby największe kawałki były na początku
    const sorted = [...this.categories].sort((a, b) => b.count - a.count);

    // Generujemy kolory dla każdej kategorii z palety (lub HSL w pętli)
    const backgroundColors = sorted.map((_, index) => {
      if (index < this.extendedPalette.length) {
        return this.extendedPalette[index];
      }
      // Rezerwowe wyliczanie barw, jeśli kategorii będzie więcej niż 24
      const hue = (index * 137.5) % 360;
      return `hsl(${hue}, 70%, 55%)`;
    });

    this.categoryChartData = {
      labels: sorted.map(c => c.category),
      datasets: [{
        data: sorted.map(c => c.count),
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderColor: '#0f172a' // ciemny border ładnie separuje segmenty
      }]
    };

    this.refreshCharts();
  }

  private updateLocationChart(): void {
    if (!this.locations?.length) return;

    // Pobieramy Top N miast bezpośrednio z posortowanej odpowiedzi backendu
    const sliced = this.locations.slice(0, this.currentLocationLimit());

    this.locationChartData = {
      labels: sliced.map(l => l.location),
      datasets: [{
        data: sliced.map(l => l.liczba_ofert),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        minBarLength: 3 // zapewnia widoczność mniejszych miast
      }]
    };

    this.refreshCharts();
  }

  private refreshCharts(): void {
    this.charts?.forEach(c => c.update());
  }
}