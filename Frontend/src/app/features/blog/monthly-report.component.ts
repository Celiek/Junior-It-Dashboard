// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { BaseChartDirective } from 'ng2-charts';
// import { ChartConfiguration, ChartData } from 'chart.js';
// import { ThemeService } from '../../core/services/theme.service';
// import { MonthlyReportDto } from '../../core/models/blog-report.model';

// @Component({
//   selector: 'app-monthly-report',
//   standalone: true,
//   imports: [CommonModule, RouterLink, BaseChartDirective],
//   templateUrl: './monthly-report.component.html',
//   styleUrls: ['./monthly-report.component.css']
// })
// export class MonthlyReportComponent implements OnInit {
//   themeService = inject(ThemeService);

//   report: MonthlyReportDto | null = null;

//   // 1. Wykres: Technologie (Bar Chart pionowy)
//   public techChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         callbacks: {
//           label: (context) => ` Oferty: ${context.parsed.y}`
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: { color: '#94a3b8', font: { size: 12 } }
//       },
//       y: {
//         grid: { color: 'rgba(51, 65, 85, 0.4)' },
//         ticks: { color: '#94a3b8' }
//       }
//     }
//   };
//   public techChartData: ChartData<'bar'> = { labels: [], datasets: [] };

//   // 2. Wykres: Zarobki (Bar Chart pionowy)
//   public salaryChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         callbacks: {
//           label: (context) => ` Średnia: ${context.parsed.y.toLocaleString('pl-PL')} PLN`
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: { color: '#94a3b8', font: { size: 12 } }
//       },
//       y: {
//         grid: { color: 'rgba(51, 65, 85, 0.4)' },
//         ticks: {
//           color: '#94a3b8',
//           callback: (val) => `${val} PLN`
//         }
//       }
//     }
//   };
//   public salaryChartData: ChartData<'bar'> = { labels: [], datasets: [] };

//   // 3. Wykres: Pracodawcy (Bar Chart poziomy)
//   public employerChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     maintainAspectRatio: false,
//     indexAxis: 'y', // poziome słupki
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         callbacks: {
//           label: (context) => ` Opublikowane oferty: ${context.parsed.x}`
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: { color: 'rgba(51, 65, 85, 0.4)' },
//         ticks: { color: '#94a3b8' }
//       },
//       y: {
//         grid: { display: false },
//         ticks: { color: '#f8fafc', font: { size: 12, weight: 'bold' } }
//       }
//     }
//   };
//   public employerChartData: ChartData<'bar'> = { labels: [], datasets: [] };

//   ngOnInit(): void {
//     // Dane z API lub mocka raportu
//     this.report = {
//       period: 'PAŹDZIERNIK 2026',
//       totalOffers: 9282,
//       salaryDataAvailable: true, // Zmień na false, by przetestować fallback informacyjny
//       salariesByContract: [
//         { contractType: 'B2B', avgSalary: 9450, offersWithSalaryCount: 840 },
//         { contractType: 'UoP', avgSalary: 9000, offersWithSalaryCount: 1420 },
//         { contractType: 'Zlecenie', avgSalary: 4800, offersWithSalaryCount: 210 }
//       ],
//       topTechnologies: [
//         { name: 'SQL', count: 2637 },
//         { name: 'Python', count: 1209 },
//         { name: 'Java', count: 1177 },
//         { name: 'Git', count: 1136 },
//         { name: 'Linux', count: 923 },
//         { name: 'JavaScript', count: 887 },
//         { name: 'Docker', count: 613 }
//       ],
//       topEmployers: [
//         { companyName: 'Nokia', offersCount: 34 },
//         { companyName: 'Sii Polska', offersCount: 42 },
//         { companyName: 'Capgemini', offersCount: 51 },
//         { companyName: 'Asseco Poland', offersCount: 63 },
//         { companyName: 'Comarch', offersCount: 74 }
//       ]
//     };

//     this.renderCharts();
//   }

//   private renderCharts(): void {
//     if (!this.report) return;

//     // Inicjalizacja technologii
//     this.techChartData = {
//       labels: this.report.topTechnologies.map(t => t.name),
//       datasets: [{
//         data: this.report.topTechnologies.map(t => t.count),
//         backgroundColor: '#6366f1',
//         hoverBackgroundColor: '#818cf8',
//         borderRadius: 6
//       }]
//     };

//     // Inicjalizacja zarobków
//     if (this.report.salaryDataAvailable && this.report.salariesByContract.length > 0) {
//       this.salaryChartData = {
//         labels: this.report.salariesByContract.map(s => s.contractType),
//         datasets: [{
//           data: this.report.salariesByContract.map(s => s.avgSalary),
//           backgroundColor: ['#06b6d4', '#6366f1', '#f59e0b'],
//           borderRadius: 6
//         }]
//       };
//     }

//     // Inicjalizacja pracodawców
//     this.employerChartData = {
//       labels: this.report.topEmployers.map(e => e.companyName),
//       datasets: [{
//         data: this.report.topEmployers.map(e => e.offersCount),
//         backgroundColor: '#3b82f6',
//         hoverBackgroundColor: '#60a5fa',
//         borderRadius: 4
//       }]
//     };
//   }
// }