import { Component, Input, OnChanges, SimpleChanges, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration } from 'chart.js';
import { TechnologyDto } from '../../../core/models/market-api.models';

@Component({
  selector: 'app-tech-frequency-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <!-- Nagłówek ze sterowaniem suwaka -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-base">Top Technologie w ofertach</h3>
          <p class="text-xs text-slate-500">Liczba wystąpień w tablicy wymagań technicznych w ogłoszeniach </p>
        </div>

        <!-- Slider wyboru limitu -->
        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <label for="techLimit" class="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Ilość technologii : <span class="text-indigo-600 dark:text-indigo-400 font-bold">{{ currentLimit() }}</span>
          </label>
          <input
            id="techLimit"
            type="range"
            [min]="5"
            [max]="maxLimit()"
            [step]="1"
            [value]="currentLimit()"
            (input)="onLimitChange($event)"
            class="w-28 sm:w-36 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      <!-- Canvas z dynamiczną wysokością dopasowaną do liczby pozycji -->
      <div class="relative" [style.height.px]="containerHeight">
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="'bar'">
        </canvas>
      </div>
    </div>
  `
})
export class TechFrequencyChartComponent implements OnChanges {
  @Input() technologies: TechnologyDto[] = [];
  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  currentLimit = signal<number>(10);
  maxLimit = signal<number>(100);

  public chartData: ChartData<'bar'> = { labels: [], datasets: [] };

  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Oferty: ${context.parsed.y ?? context.parsed.x}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#1e293b' }
      }
    }
  };

  // Oblicza wysokość wykresu w zależności od tego, ile słupków renderujemy
  get containerHeight(): number {
    return Math.max(260, this.currentLimit() * 18);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['technologies'] && this.technologies?.length) {
      // Ustawiamy maksymalny zasięg suwaka na faktyczną liczbę dostępnych technologii (max 50)
      const count = this.technologies.length;
      this.maxLimit.set(Math.min(count, 100));

      if (this.currentLimit() > this.maxLimit()) {
        this.currentLimit.set(this.maxLimit());
      }

      this.updateChart();
    }
  }

  onLimitChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentLimit.set(Number(input.value));
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.technologies?.length) return;

    // 1. Sortujemy technologie malejąco
    const sorted = [...this.technologies].sort((a, b) => b.count - a.count);

    // 2. Tniemy wg aktualnego limitu wybranego suwakiem
    const sliced = sorted.slice(0, this.currentLimit());

    this.chartData = {
      labels: sliced.map(t => t.technology.toUpperCase()),
      datasets: [{
        data: sliced.map(t => t.count),
        label: 'Liczba ofert',
        backgroundColor: '#6366f1',
        borderRadius: 4
      }]
    };

    // Wymuszenie odświeżenia instancji Chart.js
    this.chartDirective?.update();
  }
}