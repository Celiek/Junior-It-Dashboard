import { Component, Input, OnChanges, SimpleChanges, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { SalaryOfferDto } from '../../../core/models/market-api.models';
import { normalizeContractType, isMonthlyRate } from '../../../core/utils/contract-normalizer';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-salary-trend-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-base">Średnie zarobki w czasie (PLN/mc)</h3>
          <p class="text-xs text-slate-500">Miesięczne stawki uśrednione z pola <code>averageSalary</code></p>
        </div>
      </div>
      <div class="relative h-72">
        <canvas baseChart [data]="chartData" [options]="chartOptions" [type]="'line'"></canvas>
      </div>
    </div>
  `
})
export class SalaryTrendChartComponent implements OnChanges {
  @Input() rawSalaries: SalaryOfferDto[] = [];
  private themeService = inject(ThemeService);

  public chartData: ChartData<'line'> = { labels: [], datasets: [] };
  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#64748b' } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } }
    }
  };

  constructor() {
    effect(() => {
      const colors = this.themeService.getChartColors();
      if (this.chartOptions?.scales) {
        if (this.chartOptions.scales['x']) this.chartOptions.scales['x'].ticks = { color: colors.text };
        if (this.chartOptions.scales['y']) {
          this.chartOptions.scales['y'].ticks = { color: colors.text };
          this.chartOptions.scales['y'].grid = { color: colors.grid };
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rawSalaries'] && this.rawSalaries?.length) {
      this.processData();
    }
  }

  private processData(): void {
    const monthlyItems = this.rawSalaries.filter(isMonthlyRate);
    
    // Sortowanie chronologiczne po dacie
    const months = Array.from(new Set(monthlyItems.map(i => i.month.slice(0, 7)))).sort();

    const getAvg = (monthStr: string, group: string) => {
      const matches = monthlyItems.filter(i => i.month.startsWith(monthStr) && normalizeContractType(i.contractType) === group);
      if (!matches.length) return null;
      const totalWeight = matches.reduce((acc, m) => acc + m.offersCount, 0);
      const totalSum = matches.reduce((acc, m) => acc + (m.averageSalary * m.offersCount), 0);
      return totalWeight ? Math.round(totalSum / totalWeight) : null;
    };

    this.chartData = {
      labels: months,
      datasets: [
        {
          label: 'UoP (średnia)',
          data: months.map(m => getAvg(m, 'UoP')),
          borderColor: '#4f46e5',
          backgroundColor: '#4f46e5',
          tension: 0.3
        },
        {
          label: 'B2B (średnia)',
          data: months.map(m => getAvg(m, 'B2B')),
          borderColor: '#06b6d4',
          backgroundColor: '#06b6d4',
          tension: 0.3
        },
        {
          label: 'Zlecenie / Mandate',
          data: months.map(m => getAvg(m, 'Zlecenie')),
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          tension: 0.3
        }
      ]
    };
  }
}