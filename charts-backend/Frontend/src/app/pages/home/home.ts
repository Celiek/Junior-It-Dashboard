import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ChartDataService } from '../../services/chart-data.service';

@Component({
  selector: 'app-home',
  imports: [BaseChartDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  public chartTitle = 'Oferty pracy według lokalizacji';

  public chartType: 'bar' = 'bar';

  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Liczba ofert',
        data: []
      }
    ]
  };

  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Oferty pracy według lokalizacji'
      }
    }
  };

  constructor(private chartDataService: ChartDataService) {}

  ngOnInit(): void {
    this.chartDataService.getOffersByLocation().subscribe({
      next: response => {
        this.chartData = {
          labels: response.map(item => item.location),
          datasets: [
            {
              label: 'Liczba ofert',
              data: response.map(item => item.liczba_ofert)
            }
          ]
        };
      },
      error: error => {
        console.error('Błąd pobierania danych z API:', error);
        this.chartTitle = 'Nie udało się pobrać danych z API';
      }
    });
  }
}