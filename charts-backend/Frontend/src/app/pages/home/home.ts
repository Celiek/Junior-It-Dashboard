import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'angular-highcharts';
import { Chart } from 'angular-highcharts';
import {
  ChartDataService,
  JobTechnologyStats,
  JobLocationStats,
  AverageSalaryByContractStats,
  OffersByCategory
} from '../../services/chart-data.service';


import * as Highcharts from 'highcharts';


Highcharts.setOptions({

  colors: [
    '#36A2EB',
    '#4BC0C0',
    '#FFCE56',
    '#FF6384',
    '#9966FF',
    '#FF9F40',
    '#8BC34A',
    '#26C6DA',
    '#5C6BC0',
    '#66BB6A'
  ],

  chart: {
    backgroundColor: '#ffffff',
    style: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif'
    }
  },

  title: {
    style: {
      color: '#333',
      fontSize: '18px',
      fontWeight: '600'
    }
  },

  subtitle: {
    style: {
      color: '#666'
    }
  },

  xAxis: {
    lineColor: '#dddddd',
    tickColor: '#dddddd',
    gridLineWidth: 0,
    labels: {
      style: {
        color: '#555',
        fontSize: '12px'
      }
    }
  },

  yAxis: {
    gridLineColor: '#eeeeee',

    labels: {
      style: {
        color: '#555',
        fontSize: '12px'
      }
    },

    title: {
      style: {
        color: '#555',
        fontSize: '13px'
      }
    }
  },

  legend: {
    itemStyle: {
      color: '#444',
      fontWeight: '500'
    }
  },

  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#dddddd',
    borderRadius: 8,
    shadow: false
  },

  plotOptions: {

    series: {
      animation: {
        duration: 500
      }
    },

    bar: {
      colorByPoint: true
    },

    column: {
      colorByPoint: true
    }
  }

});


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [ChartModule]
})
export class Home implements OnInit {

  

  locationChart!: Chart;
  technologyChart!: Chart;
  salaryChart!: Chart;
  offersByCategoryChart!: Chart;

  constructor(
    private chartDataService: ChartDataService,
    private cdr: ChangeDetectorRef
  ) {}

  public locationChartTitle = 'Oferty pracy według lokalizacji';
  public technologyChartTitle = 'Najpopularniejsze technologie w ofertach pracy';
  public salaryChartTitle = 'Średnie zarobki według rodzaju umowy';
  public offersByCategoryChartTitle = 'Oferty pracy według kategorii';

  ngOnInit(): void {
    this.loadLocationChart();
    this.loadTechnologyChart();
    this.loadSalaryChart();
    this.loadOffersByCategoryChart();
  }

  private loadLocationChart(): void {
    this.chartDataService.getOffersByLocation().subscribe({
    next: (response) => {

      const top = response
        .filter(i => i.location && i.liczba_ofert != null)
        .sort((a, b) => Number(b.liczba_ofert) - Number(a.liczba_ofert))
        .slice(0, 30);

      const labels = top.map(i => i.location);
      const data = top.map(i => Number(i.liczba_ofert));

      this.locationChart = new Chart({
        chart: {
          type: 'bar',
          height: 900,
          width: null,
          backgroundColor: '#ffffff',
          plotBackgroundColor: '#ffffff',
          plotBorderWidth: 0,
          style: {
            fontFamily: 'Arial'
          },
        },
        title: { text: 'Oferty pracy według lokalizacji',style: { color: '#000000', fontSize: '18px', fontWeight: '600' } },
        xAxis: { categories: labels,labels: { style: { color: '#000000' } } },
        yAxis: { title: { text: 'Liczba ofert' }, labels: { style: { color: '#000000' } } },
        plotOptions: {
          bar: {
            pointWidth: 20,
            pointPadding: 1,
            groupPadding: 0.05,
            colorByPoint: true
          }
        },
        legend: { itemStyle: { color: '#000000' } },
        series: [
          {
            type: 'bar',
            name: 'Liczba ofert',
            data: data
          }
        ]
      });


      queueMicrotask(() => {
        this.cdr.detectChanges();


        this.locationChart.ref?.redraw();
        this.locationChart.ref?.reflow();
      });
    }
  });
  }

  private loadTechnologyChart(): void {
    this.chartDataService.getOffersByTechnology().subscribe({
      next: (response: JobTechnologyStats[]) => {

        const top = response
          .filter(i => i.technology && i.count != null)
          .sort((a, b) => Number(b.count) - Number(a.count))
          .slice(0, 100);

        const labels = top.map(i => i.technology);
        const data = top.map(i => Number(i.count));

        this.technologyChart = new Chart({
        chart: {
          type: 'bar',
          height: 1900,
          width: null,
          backgroundColor: '#ffffff',
          plotBackgroundColor: '#ffffff',
          plotBorderWidth: 0,
          style: {
            fontFamily: 'Arial'
          },
        },
        title: { text: 'Najpopularniejsze technologie',style: { color: '#000000', fontSize: '18px', fontWeight: '600' } },
        xAxis: { categories: labels,labels: { style: { color: '#000000' } } },
        yAxis: { title: { text: 'Liczba ofert z podziałem na kategorie' }, labels: { style: { color: '#000000' } } },
        plotOptions: {
          bar: {
            pointWidth: 15,
            pointPadding: 2,
            groupPadding: 0.5,
            colorByPoint: true
          }
        },
        legend: { itemStyle: { color: '#000000' } },
        series: [
          {
            type: 'bar',
            name: 'Liczba ofert',
            data: data
          }
        ]
      });

      queueMicrotask(() => {
        this.cdr.detectChanges();
        this.technologyChart.ref?.redraw();
        this.technologyChart.ref?.reflow();
      });
    }
  });
  }

  private loadSalaryChart(): void {
    this.chartDataService.getAverageSalaryByContractType().subscribe({
      next: (response: AverageSalaryByContractStats[]) => {

        const valid = response.filter(i =>
          i.contractType &&
          i.month &&
          i.averageSalary != null &&
          i.offersCount != null
        );

        if (valid.length === 0) {
          this.salaryChart = new Chart({
            chart: {type: 'bar'},
            series:[]});
          return;
        }

        const months = Array.from(new Set(valid.map(i => i.month)))
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const contractTotals = new Map<string, number>();
        valid.forEach(i => {
          contractTotals.set(
            i.contractType,
            (contractTotals.get(i.contractType) ?? 0) + Number(i.offersCount)
          );
        });

        const topContracts = Array.from(contractTotals.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(e => e[0]);

        const salaryMap = new Map<string, number>();
        valid.forEach(i => {
          salaryMap.set(`${i.month}|${i.contractType}`, Math.round(Number(i.averageSalary)));
        });

        const series = topContracts.map(contract => ({
          name: contract,
          type: 'line',
          data: months.map(m => salaryMap.get(`${m}|${contract}`) ?? null)
        }));

      this.salaryChart = new Chart({
        chart: {
          type: 'line',
          height: 600,
          backgroundColor: '#ffffff'
        },
        colors: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
        title: {
          text: 'Średnie zarobki według rodzaju umowy',
          style: { color: '#333333' }
        },
        xAxis: {
          categories: months.map(m => this.formatMonth(m)),
          labels: { style: { color: '#333333' } }
        },
        yAxis: {
          title: { text: 'Średnie zarobki (PLN)', style: { color: '#333333' } },
          labels: { style: { color: '#333333' } }
        },
        plotOptions: {
          series: {
            marker: { enabled: true },
            lineWidth: 3
          }
        },
        series
      });

      queueMicrotask(() => {
        this.cdr.detectChanges();
        this.salaryChart.ref?.redraw();
        this.salaryChart.ref?.reflow();
      });
    }
  });
}

private loadOffersByCategoryChart(): void {
  this.chartDataService.getOffersByCategory().subscribe({
    next: (response: OffersByCategory[]) => {

      const top = response
        .filter(i => i.category && i.count != null)
        .sort((a, b) => Number(b.count) - Number(a.count))
        .slice(0, 100);

      const labels = top.map(i => i.category);
      const data = top.map(i => Number(i.count));

      this.offersByCategoryChart = new Chart({
        chart: {
          type: 'bar',
          height: 900,
          backgroundColor: '#ffffff'
        },
        colors: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
        title: {
          text: 'Oferty pracy według kategorii',
          style: { color: '#333333' }
        },
        xAxis: {
          categories: labels,
          labels: { style: { color: '#333333' } }
        },
        yAxis: {
          title: { text: 'Liczba ofert', style: { color: '#333333' } },
          labels: { style: { color: '#333333' } }
        },
        plotOptions: {
          bar: {
            pointWidth: 20,
            pointPadding: 1,
            groupPadding: 0.05
          }
        },
        series: [
          {
            type: 'bar',
            name: 'Liczba ofert',
            data: data
          }
        ]
      });


      queueMicrotask(() => {
        this.cdr.detectChanges();
        this.offersByCategoryChart.ref?.redraw();
        this.offersByCategoryChart.ref?.reflow();
      });
    }
  });
}


  private formatMonth(month: string): string {
    return new Intl.DateTimeFormat('pl-PL', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(month));
  }
}
