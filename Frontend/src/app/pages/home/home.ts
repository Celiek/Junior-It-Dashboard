import { Component, OnInit, viewChildren } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import {
  ChartDataService,
  JobTechnologyStats,
  JobLocationStats,
  AverageSalaryByContractStats,
  OffersByCategory
} from '../../services/chart-data.service';

const CHART_COLORS = {
  indigo: { bg: 'rgba(99, 102, 241, 0.85)', border: '#4f46e5' },
  teal:   { bg: 'rgba(20, 184, 166, 0.85)', border: '#0d9488' },
  coral:  { bg: 'rgba(244, 63, 94, 0.85)',  border: '#e11d48' },
  amber:  { bg: 'rgba(245, 158, 11, 0.85)', border: '#d97706' },
  purple: { bg: 'rgba(168, 85, 247, 0.85)', border: '#9333ea' },
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private charts = viewChildren(BaseChartDirective);

  public locationChartTitle = 'Oferty pracy według lokalizacji';
  public technologyChartTitle = 'Najpopularniejsze technologie w ofertach pracy';
  public salaryChartTitle = 'Średnie zarobki według rodzaju umowy';
  public offersByCategoryChartTitle = 'Oferty pracy według kategorii';

  public locationChartType: 'bar' = 'bar';
  public technologyChartType: 'bar' = 'bar';
  public salaryChartType: 'bar' = 'bar';
  public offersByCategoryChartType: 'bar' = 'bar';

  public locationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Liczba ofert', data: [] }],
  };

  public technologyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Liczba ofert', data: [] }],
  };

  public salaryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  public offersByCategoryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Liczba ofert', data: [] }],
  };

  public locationChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Oferty pracy według lokalizacji',
        color: '#0f172a',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 16 }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
          autoSkip: false,
        },
      },
    },
  };

  public technologyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Oferty pracy według technologii',
        color: '#0f172a',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 16 }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
          autoSkip: false,
        },
      },
    },
  };

  public salaryChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Średnie zarobki według rodzaju umowy i miesiąca',
        color: '#0f172a',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 16 }
      },
      tooltip: {
        callbacks: {
          label: context => {
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return `${context.dataset.label}: brak danych`;
            }
            return `${context.dataset.label}: ${Number(value).toLocaleString('pl-PL')} zł`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
          callback: value => `${Number(value).toLocaleString('pl-PL')} zł`,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 20,
        },
      },
    },
  };

  public offersByCategoryChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Oferty pracy według kategorii (podział według nazwy stanowiska)',
        color: '#0f172a',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 16 }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#1e293b',
          font: { size: 13, weight: 500 },
          autoSkip: false,
        },
      },
    },
  };

  constructor(private chartDataService: ChartDataService) {}

  ngOnInit(): void {
    this.loadLocationChart();
    this.loadTechnologyChart();
    this.loadSalaryChart();
    this.loadOffersByCategoryChart();
  }

  private refreshCharts(): void {
    setTimeout(() => {
      this.charts().forEach(chart => chart.update());
    }, 0);
  }

  private loadLocationChart(): void {
    this.chartDataService.getOffersByLocation().subscribe({
      next: (response: JobLocationStats[]) => {
        const topLocations = response
          .filter(item =>
            item.location &&
            item.liczba_ofert !== null &&
            item.liczba_ofert !== undefined
          )
          .sort((a, b) => Number(b.liczba_ofert) - Number(a.liczba_ofert))
          .slice(0, 30);

        this.locationChartData = {
          labels: topLocations.map(item => item.location),
          datasets: [
            {
              label: 'Liczba ofert',
              data: topLocations.map(item => Number(item.liczba_ofert)),
              backgroundColor: CHART_COLORS.indigo.bg,
              borderColor: CHART_COLORS.indigo.border,
              borderWidth: 1.5,
              borderRadius: 6,
              hoverBackgroundColor: CHART_COLORS.indigo.border,
            },
          ],
        };
        this.refreshCharts();
      },
      error: error => {
        console.error('Błąd pobierania lokalizacji:', error);
        this.locationChartTitle = 'Nie udało się pobrać danych lokalizacji';
      },
    });
  }

  private loadTechnologyChart(): void {
    this.chartDataService.getOffersByTechnology().subscribe({
      next: (response: JobTechnologyStats[]) => {
        const topTechnologies = response
          .filter(item =>
            item.technology &&
            item.count !== null &&
            item.count !== undefined
          )
          .sort((a, b) => Number(b.count) - Number(a.count))
          .slice(0, 100);

        this.technologyChartData = {
          labels: topTechnologies.map(item => item.technology),
          datasets: [
            {
              label: 'Liczba ofert',
              data: topTechnologies.map(item => Number(item.count)),
              backgroundColor: CHART_COLORS.teal.bg,
              borderColor: CHART_COLORS.teal.border,
              borderWidth: 1.5,
              borderRadius: 6,
              hoverBackgroundColor: CHART_COLORS.teal.border,
            },
          ],
        };
        this.refreshCharts();
      },
      error: error => {
        console.error('Błąd pobierania technologii:', error);
        this.technologyChartTitle = 'Nie udało się pobrać danych technologii';
      },
    });
  }

  private loadSalaryChart(): void {
    this.chartDataService.getAverageSalaryByContractType().subscribe({
      next: (response: AverageSalaryByContractStats[]) => {
        const validData = response.filter(item =>
          item.contractType &&
          item.month &&
          item.averageSalary !== null &&
          item.averageSalary !== undefined &&
          item.offersCount !== null &&
          item.offersCount !== undefined
        );

        if (validData.length === 0) {
          this.salaryChartTitle = 'Brak danych o zarobkach';
          this.salaryChartData = { labels: [], datasets: [] };
          return;
        }

        const months = Array.from(
          new Set(validData.map(item => item.month))
        ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const contractOfferCount = new Map<string, number>();

        validData.forEach(item => {
          const current = contractOfferCount.get(item.contractType) ?? 0;
          contractOfferCount.set(
            item.contractType,
            current + Number(item.offersCount)
          );
        });

        const topContractTypes = Array.from(contractOfferCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(entry => entry[0]);

        const salaryMap = new Map<string, number>();

        validData.forEach(item => {
          const key = `${item.month}|${item.contractType}`;
          salaryMap.set(key, Math.round(Number(item.averageSalary)));
        });

        const contractColors = [
          CHART_COLORS.indigo,
          CHART_COLORS.teal,
          CHART_COLORS.coral,
          CHART_COLORS.amber,
        ];

        this.salaryChartTitle = 'Średnie zarobki według rodzaju umowy i miesiąca';

        this.salaryChartData = {
          labels: months.map(month => this.formatMonth(month)),
          datasets: topContractTypes.map((contractType, index) => {
            const color = contractColors[index % contractColors.length];
            return {
              label: contractType,
              data: months.map(month => {
                const key = `${month}|${contractType}`;
                return salaryMap.get(key) ?? null;
              }),
              backgroundColor: color.bg,
              borderColor: color.border,
              borderWidth: 1.5,
              borderRadius: 4,
            };
          }),
        };
        this.refreshCharts();
      },
      error: error => {
        console.error('Błąd pobierania średnich zarobków:', error);
        this.salaryChartTitle = 'Nie udało się pobrać danych o zarobkach';
      },
    });
  }

  private formatMonth(month: string): string {
    return new Intl.DateTimeFormat('pl-PL', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(month));
  }

  private loadOffersByCategoryChart(): void {
    this.chartDataService.getOffersByCategory().subscribe({
      next: (response: OffersByCategory[]) => {
        const jobCategories = response
          .filter(item => item.category && item.count !== null && item.count !== undefined)
          .sort((a, b) => Number(b.count) - Number(a.count))
          .slice(0, 100);

        if (jobCategories.length === 0) {
          this.offersByCategoryChartTitle = 'Brak danych o ofertach';
          this.offersByCategoryChartData = { labels: [], datasets: [] };
          return;
        }

        this.offersByCategoryChartTitle = 'Liczba ofert według kategorii';

        this.offersByCategoryChartData = {
          labels: jobCategories.map(item => item.category),
          datasets: [
            {
              label: 'Liczba ofert',
              data: jobCategories.map(item => Number(item.count)),
              backgroundColor: CHART_COLORS.purple.bg,
              borderColor: CHART_COLORS.purple.border,
              borderWidth: 1.5,
              borderRadius: 6,
              hoverBackgroundColor: CHART_COLORS.purple.border,
            },
          ],
        };
        this.refreshCharts();
      },
      error: error => {
        console.error('Błąd pobierania ofert według kategorii:', error);
        this.offersByCategoryChartTitle = 'Nie udało się pobrać danych o ofertach';
      },
    });
  }
}