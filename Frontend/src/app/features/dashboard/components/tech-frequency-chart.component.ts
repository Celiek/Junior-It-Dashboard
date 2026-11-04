import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData,TooltipItem } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { TechnologyDto } from '../../../core/models/market-api.models';

// Rejestracja kontrolera treemap w silniku Chart.js
Chart.register(TreemapController, TreemapElement);

@Component({
  selector: 'app-tech-frequency-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      <!-- Nagłówek sekcji -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
          Popularność Technologii w Wymaganiach
        </h2>
        <p class="text-md text-slate-500 dark:text-slate-400">
          Zestawienie kluczowych kompetencji: Top 10 liderów rynku oraz mapa pozostałych technologii specjalistycznych.
        </p>
      </div>

      <!-- Układ 2 kolumn: Top 10 (Słupki) + Pozostałe (Treemap) -->
      <div *ngIf="technologies && technologies.length > 0" class="tech-layout-grid">
        
        <!-- Kolumna lewa: Top 10 (Pionowe słupki z dokładną skalą) -->
        <div class="tech-panel">
          <div class="panel-header">
            <span class="panel-badge-secondary">TOP 10</span>
            <span class="panel-title">Najczęściej poszukiwane</span>
          </div>
          
          <div class="chart-container">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <!-- Kolumna prawa: Treemap (Pozostałe technologie bez scrollowania) -->
        <div class="tech-panel">
          <div class="panel-header">
            <span class="panel-badge-secondary">Pozostałe technologie</span>
            <span class="panel-title">Miejsca 11–{{ technologies.length }}</span>
          </div>

          <div class="chart-container" *ngIf="hasTreemapData; else noTreemapData">
            <canvas baseChart
              [data]="treemapData"
              [options]="treemapOptions"
              [type]="'treemap'">
            </canvas>
          </div>

          <ng-template #noTreemapData>
            <div class="empty-panel">
              Zbyt mała liczba technologii w bazie do wygenerowania mapy (wymagane > 10).
            </div>
          </ng-template>
        </div>

      </div>

      <div *ngIf="!technologies || technologies.length === 0" class="text-center py-12 text-slate-400 text-sm">
        Brak danych o technologiach w wybranym okresie.
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .tech-layout-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      width: 100%;
    }

    @media (min-width: 1024px) {
      .tech-layout-grid {
        grid-template-columns: 38% calc(62% - 1.5rem)
      }
    }

    .tech-panel {
      background-color: rgba(15, 23, 42, 0.4);
      border: 1px solid #1e293b;
      border-radius: 0.875rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .panel-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background-color: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.4);
    }

    .panel-badge-secondary {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      background-color: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.4);
    }

    .panel-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .chart-container {
      position: relative;
      width: 100%;
      height: 440px; /* stała wysokość eliminująca scrollowanie */
    }

    .empty-panel {
      height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 0.85rem;
      text-align: center;
      padding: 1rem;
    }
  `]
})
export class TechFrequencyChartComponent implements OnChanges {
  @Input() technologies: TechnologyDto[] = [];
  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  hasTreemapData: boolean = false;

  // 1. Opcje dla wykresu słupkowego (Top 10)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const parsedY = (ctx.parsed as { y: number }).y;
            return ` Liczba ofert: ${parsedY}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#cbd5e1',
          font: { size: 12, weight: 'bold' }
        }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  // 2. Opcje dla wykresu Treemap (Miejsca 11+)
  public treemapOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any[]) => items[0]?.raw?._data?.name || '',
          label: (item: any) => ` Liczba ofert: ${item.raw?._data?.value || 0}`
        }
      }
    }
  };

  public treemapData: any = {
    datasets: []
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['technologies'] && this.technologies?.length) {
      this.processData();
    }
  }

  private processData(): void {
    // Sortowanie malejąco
    const sorted = [...this.technologies].sort((a, b) => b.count - a.count);

    // 1. TOP 10
    const top10 = sorted.slice(0, 10);
    this.barChartData = {
      labels: top10.map(t => t.technology),
      datasets: [{
        data: top10.map(t => t.count),
        backgroundColor: '#6366f1',
        hoverBackgroundColor: '#818cf8',
        borderRadius: 4,
        maxBarThickness: 32,
      }]
    };

    // 2. POZOSTAŁE (Miejsca 11-50 lub wszystkie pozostałe)
    const rest = sorted.slice(10, 50);
    this.hasTreemapData = rest.length > 0;

    if (this.hasTreemapData) {
      const maxVal = rest[0].count;
      const minVal = rest[rest.length - 1].count;

      this.treemapData = {
        datasets: [{
          tree: rest.map(t => ({ name: t.technology, value: t.count })),
          key: 'value',
          groups: ['name'],
          spacing: 2,
          borderWidth: 1,
          borderColor: '#1e293b',
          borderRadius: 4,
          // Dynamiczne kolorowanie kafli w odcieniach slate/indygo
          backgroundColor: (ctx: any) => {
            const val = ctx.raw?._data?.value;
            if (!val) return '#1e293b';
            const ratio = maxVal === minVal ? 1 : (val - minVal) / (maxVal - minVal);
            // Gradient od ciemniejszego indygo do jasnego indygo
            const alpha = 0.35 + ratio * 0.55;
            return `rgba(99, 102, 241, ${alpha})`;
          },
          labels: {
            display: true,
            color: '#f8fafc',
            overflow: 'hidden',
            padding: 3,
            align: 'center',
            position: 'center',
            font: {
              size: 12,
              weight: 'bold'
            },
            formatter: (ctx: any) => {
              const rawName: string = ctx.raw?._data?.name || '';
              const rawValue = ctx.raw?._data?.value;
              if (!rawName) return [];
              const nameLines = rawName.trim().split(/\s+/);
              return [...nameLines, `${rawValue}`];
            }
          }
        }]
      };
    }
  }
}