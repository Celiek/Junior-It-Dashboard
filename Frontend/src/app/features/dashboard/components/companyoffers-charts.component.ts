import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { CompanyOffersDTO } from '../../../core/models/market-api.models';

@Component({
  selector: 'app-companyoffers-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      
      <!-- Nagłówek i kontrolka suwaka -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
            Najbardziej Aktywni Pracodawcy
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Liczba ogłoszeń opublikowanych przez poszczególne firmy.
          </p>
        </div>

        <!-- Slider zakresu -->
        <div *ngIf="companyOffers && companyOffers.length > 5" class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <label for="companySlider" class="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Pokaż: <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-sm">{{ displayLimit }}</span> firm
          </label>
          <input 
            id="companySlider"
            type="range"
            [min]="5"
            [max]="maxLimit"
            [step]="1"
            [(ngModel)]="displayLimit"
            (ngModelChange)="onSliderChange()"
            class="w-28 sm:w-36 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      <!-- Obszar wykresu z dynamiczną wysokością -->
      <div 
        class="chart-container" 
        *ngIf="companyOffers && companyOffers.length > 0"
        [style.height.px]="calculatedChartHeight">
        <canvas baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="'bar'">
        </canvas>
      </div>

      <div *ngIf="!companyOffers || companyOffers.length === 0" class="text-center py-8 text-slate-400 text-sm">
        Brak danych o pracodawcach w wybranym okresie.
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
      /* Płynne rozszerzanie diva przy przesuwaniu suwaka */
      transition: height 0.25s ease-out;
    }
  `]
})
export class CompanyOffersChartsComponent implements OnChanges {
  @Input() companyOffers: CompanyOffersDTO[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  displayLimit: number = 10;
  maxLimit: number = 30;

  // Obliczana dynamicznie wysokość kontenera w px
  get calculatedChartHeight(): number {
    const rowHeight = 36; // 36px na każdy słupek wraz z marginesem
    const basePadding = 60; // Miejsce na dolną oś z liczbami
    return Math.max(260, this.displayLimit * rowHeight + basePadding);
  }

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Opublikowane oferty: ${context.parsed.x}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#f8fafc',
          font: { size: 12, weight: 'bold' }
        }
      }
    }
  };

  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyOffers'] && this.companyOffers?.length) {
      this.maxLimit = Math.min(this.companyOffers.length, 200);
      if (this.displayLimit > this.maxLimit) {
        this.displayLimit = this.maxLimit;
      }
      this.updateChart();
    }
  }

  onSliderChange(): void {
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.companyOffers || this.companyOffers.length === 0) return;

    const sorted = [...this.companyOffers]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, this.displayLimit);

    this.chartData = {
      labels: sorted.map(item => item.company),
      datasets: [{
        data: sorted.map(item => item.amount),
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#60a5fa',
        borderRadius: 4,
        barThickness: 20,       // Stała, czytelna grubość każdego słupka
        maxBarThickness: 24
      }]
    };

    // Chart.js przelicza proporcje po zmianie wysokości kontenera
    setTimeout(() => {
      this.chart?.chart?.resize();
      this.chart?.update();
    }, 50);
  }
}