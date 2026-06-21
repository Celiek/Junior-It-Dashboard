import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-demo-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './demo-chart.html',
  styleUrl: './demo-chart.css'
})
export class DemoChartComponent {

  public chartType: ChartType = 'bar';

  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Java', 'JavaScript', 'Python', 'SQL', 'C#'],
    datasets: [
      {
        label: 'Liczba ofert',
        data: [42, 38, 25, 19, 16]
      }
    ]
  };

  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Oferty junior IT według technologii'
      }
    }
  };
}