import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import {
  ChartDataService,
  JobTechnologyStats,
  JobLocationStats,
  AverageSalaryByContractStats,
  OffersByCategory
} from '../../services/chart-data.service';

@Component({
  selector: 'app-home',
  imports: [BaseChartDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  public locationChartTitle = 'Oferty pracy według lokalizacji';
  public technologyChartTitle = 'Najpopularniejsze technologie w ofertach pracy';
  public salaryChartTitle = 'Średnie zarobki według rodzaju umowy';
  public offersByCategoryChartTitle='Oferty pracy według kategorii';


  public locationChartType: 'bar' = 'bar';
  public technologyChartType: 'bar' = 'bar';
  public salaryChartType: 'bar' = 'bar';
  public offersByCategoryChartType: 'bar' = 'bar';

  public locationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Liczba ofert',
        data: [],
      },
    ],
  };

  public technologyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Liczba ofert',
        data: [],
      },
    ],
  };

  public salaryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  public offersByCategoryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Liczba ofert',
        data: [],
      },
    ],
  };

  public locationChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Oferty pracy według lokalizacji',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        ticks: {
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
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Oferty pracy według technologii',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        ticks: {
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
    },
    title: {
      display: true,
      text: 'Średnie zarobki według rodzaju umowy i miesiąca',
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
      ticks: {
        callback: value => `${Number(value).toLocaleString('pl-PL')} zł`,
      },
    },
    x: {
      ticks: {
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
    legend: {
      display: true,
    },
    title: {
      display: true,
      text: 'Oferty pracy według kategorii (podział według nazwy stanowiska) ',
    },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
    y: {
      ticks: {
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

  private loadLocationChart(): void {
    this.chartDataService.getOffersByLocation().subscribe({
      next: (response: JobLocationStats[]) => {
        console.log('Dane lokalizacji:', response);

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
            },
          ],
        };
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
        console.log('Dane technologii z API:', response);

        const topTechnologies = response
          .filter(item =>
            item.technology &&
            item.count !== null &&
            item.count !== undefined
          )
          .sort((a, b) => Number(b.count) - Number(a.count))
          .slice(0, 100);

        console.log('Top technologie po sortowaniu:', topTechnologies);

        this.technologyChartData = {
          labels: topTechnologies.map(item => item.technology),
          datasets: [
            {
              label: 'Liczba ofert',
              data: topTechnologies.map(item => Number(item.count)),
            },
          ],
        };
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
      console.log('Dane średnich zarobków:', response);

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
        this.salaryChartData = {
          labels: [],
          datasets: [],
        };
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

      this.salaryChartTitle = 'Średnie zarobki według rodzaju umowy i miesiąca';

      this.salaryChartData = {
        labels: months.map(month => this.formatMonth(month)),
        datasets: topContractTypes.map(contractType => ({
          label: contractType,
          data: months.map(month => {
            const key = `${month}|${contractType}`;
            return salaryMap.get(key) ?? null;
          }),
        })),
      };
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
      console.log('Dane ofert według kategorii:', response);

      const jobCategories = response.filter(
        item => item.category &&
        item.count !== null &&
        item.count !== undefined)
        .sort((a, b) => Number(b.count) - Number(a.count))
        .slice(0, 100);

      if (jobCategories.length === 0) {
        this.offersByCategoryChartTitle = 'Brak danych o ofertach';
        this.offersByCategoryChartData = {
          labels: [],
          datasets: [],
        };
        return;
      }

      this.offersByCategoryChartTitle = 'Liczba ofert według kategorii';

      this.offersByCategoryChartData = {
        labels: jobCategories.map(item => item.category),
        datasets: [
          {
            label: 'Liczba ofert',
            data: jobCategories.map(item => Number(item.count)),
          },
        ],
      };
    },
    error: error => {
      console.error('Błąd pobierania ofert według kategorii:', error);
      this.offersByCategoryChartTitle = 'Nie udało się pobrać danych o ofertach';
    },
  });
}



}