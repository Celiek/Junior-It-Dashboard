import { Component, OnInit,ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ChartDataService } from '../../services/chart-data.service';

interface JobLocationStats {
  location: string;
  liczba_ofert: number;
}

@Component({
  selector: 'app-home',
  imports: [BaseChartDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective ;

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
        beginAtZero: true,
      }
    }
  };

  constructor(private chartDataService: ChartDataService) {}

  ngOnInit(): void {
    this.chartDataService.getOffersByLocation().subscribe({
      next: response => {
        console.log('Dane z API:', response);
        console.log('Pierwszy element:',response[0]);

        const topLocations = response
          .filter(item => item.location && item.liczba_ofert !== null && item.liczba_ofert !== undefined)
          .slice(0, 20);

        const labels = topLocations.map(item => item.location);
        const values = topLocations.map(item => Number(item.liczba_ofert));

        console.log('Labels:',labels);
        console.log('Values:',values);

        this.chartData.labels = labels;
        this.chartData.datasets[0].data = values;

        this.chart?.update();
      },
      error: error => {
        console.error('Błąd pobierania danych z API:', error);
        this.chartTitle = 'Nie udało się pobrać danych z API';
      }
    });
  }

}