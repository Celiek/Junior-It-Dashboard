import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ChartDataService, JobTechnologyStats,JobLocationStats }
  from '../../services/chart-data.service';

@Component({
  selector: 'app-home',
  imports: [BaseChartDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})


export class Home implements OnInit {

  public locationChartTitle = "Oferty pracy według lokalizacji";
  public technologyChartTitle = "Najpopularniejsze technologie w ofertach pracy";

  public locationChartType: 'bar' = 'bar';
  public technologyChartType: 'bar' = 'bar';

  public technologyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Najpopularniejsze Technologie',
        data: [],
      },
    ],
  };

  public locationChartData: ChartConfiguration<'bar'>['data'] = {
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
        display: true
      },
      title: {
        display: true,
        text: 'Oferty pracy według lokalizacji'
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  public technologyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Oferty pracy według technologii'
      }
    },
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        ticks: {
        autoSkip: false
        }
      }
    }
  };

  constructor(private chartDataService: ChartDataService) {}

  ngOnInit(): void {
    this.loadLocationChart();
    this.loadTechnologyChart();
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
          .slice(0, 30);

        this.locationChartData = {
          labels: topLocations.map(item => item.location),
          datasets: [
            {
              label: 'Liczba ofert',
              data: topLocations.map(item => Number(item.liczba_ofert))
            }
          ]
        };
      },
      error: error => {
        console.error('Błąd pobierania lokalizacji:', error);
        this.locationChartTitle = 'Nie udało się pobrać danych lokalizacji';
      }
    });
  }

private loadTechnologyChart(): void {
  this.chartDataService.getOffersByTechnology().subscribe({
    next: response => {
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
            data: topTechnologies.map(item => Number(item.count))
          }
        ]
      };
    },
    error: error => {
      console.error('Błąd pobierania technologii:', error);
      this.technologyChartTitle = 'Nie udało się pobrać danych technologii';
    }
  });
}
}
