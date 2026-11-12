import { 
  Component, 
  OnInit, 
  inject, 
  signal, 
  ElementRef, 
  HostListener, 
  ChangeDetectorRef, 
  ViewChild 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { 
  OfferSummaryDTO, 
  SpringPage, 
  RelistedOfferMonthlyDto, 
  CompanyDetailsData,
  CompanyMonthlySalaryDto,
  CompanyVsMarketSalaryDto,
  CompanyTechDto,
  CompanyLocationDto
} from '../../core/models/market-api.models';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent implements OnInit {
  themeService = inject(ThemeService);
  private analyticsService = inject(AnalyticsService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('donutChart') donutChart?: BaseChartDirective;
  @ViewChild('salaryChart') salaryChart?: BaseChartDirective;

  searchControl = new FormControl('');
  allCompanies: string[] = [];
  filteredCompanies: string[] = [];
  selectedCompany = signal<string | null>(null);
  isDropdownOpen = false;

  // Zakładka na dole strony ('offers' | 'relisting')
  activeBottomTab: 'offers' | 'relisting' = 'offers';

  // Szczegóły główne
  companyDetails: CompanyDetailsData | null = null;
  isLoadingDetails = false;

  // Bez widełek
  offersWithoutSalaryCount: number | null = null;
  isLoadingWithoutSalary = false;

  // Technologie
  topTechnologies: CompanyTechDto[] = [];
  isLoadingTech = false;

  // Zarobki i porównanie z rynkiem
  monthlySalaryTrend: CompanyMonthlySalaryDto[] = [];
  marketComparisonData: CompanyVsMarketSalaryDto[] = [];
  isLoadingSalaries = false;

  // Lokalizacje
  locationDistribution: CompanyLocationDto[] = [];
  isLoadingLocations = false;

  // Paginacja ofert
  pageData: SpringPage<OfferSummaryDTO> | null = null;
  currentPage = 0;
  pageSize = 10;
  isLoadingOffers = false;

  // Relisting
  relistedStats: RelistedOfferMonthlyDto[] = [];
  isLoadingRelisted = false;

  // Modal opisu
  selectedOfferForModal: OfferSummaryDTO | null = null;

  private palette = [
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#ec4899', '#8b5cf6', '#14b8a6', '#64748b', '#f97316'
  ];

  // Konfiguracja Doughnut Chart (Kategorie)
  public donutData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: this.palette,
      borderWidth: 2,
      borderColor: '#0b1120'
    }]
  };

  public donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} ofert`
        }
      }
    }
  };

  // Konfiguracja Line Chart (Firma vs Rynek)
  public salaryComparisonChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public salaryComparisonChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            return val !== null ? ` ${ctx.dataset.label}: ${Math.round(val)} PLN` : ` ${ctx.dataset.label}: brak danych`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => `${value} zł`
        },
        grid: { color: 'rgba(51, 65, 85, 0.35)' }
      }
    }
  };

  ngOnInit(): void {
    this.analyticsService.getCompanies().subscribe({
      next: (companies) => {
        this.allCompanies = Array.isArray(companies) ? companies.sort() : [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania listy firm:', err)
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterCompanies(query || '');
      this.cdr.detectChanges();
    });
  }

  filterCompanies(query: string): void {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      this.filteredCompanies = [];
      this.isDropdownOpen = false;
      return;
    }

    this.filteredCompanies = this.allCompanies
      .filter(c => c.toLowerCase().includes(trimmed))
      .slice(0, 20);

    this.isDropdownOpen = true;
  }

  onInputFocus(): void {
    if (this.searchControl.value && this.searchControl.value.trim()) {
      this.filterCompanies(this.searchControl.value);
    }
  }

  selectCompany(company: string): void {
    this.selectedCompany.set(company);
    this.searchControl.setValue(company, { emitEvent: false });
    this.isDropdownOpen = false;
    this.currentPage = 0;
    this.activeBottomTab = 'offers';

    this.loadCompanyDetails(company);
    this.loadOffersWithoutSalary(company);
    this.loadTechnologies(company);
    this.loadSalaryMetrics(company);
    this.loadLocations(company);
    this.loadRelistedStats(company);
    this.loadOffers(company, 0);

    this.cdr.detectChanges();
  }

  loadCompanyDetails(companyName: string): void {
    this.isLoadingDetails = true;
    this.cdr.detectChanges();

    this.analyticsService.getCompanyFullDetails(companyName).subscribe({
      next: (data) => {
        this.companyDetails = data;

        if (data.categories && data.categories.length > 0) {
          const sorted = [...data.categories].sort((a, b) => b.count - a.count);
          this.companyDetails.categories = sorted;

          this.donutData = {
            labels: sorted.map(c => c.category),
            datasets: [{
              data: sorted.map(c => c.count),
              backgroundColor: this.palette,
              borderWidth: 2,
              borderColor: '#0b1120'
            }]
          };
        } else {
          this.donutData = { labels: [], datasets: [] };
        }

        this.recalculateTechPercentages();

        this.isLoadingDetails = false;
        this.cdr.detectChanges();
        setTimeout(() => this.donutChart?.update(), 50);
      },
      error: (err) => {
        console.error('Błąd pobierania szczegółów pracodawcy:', err);
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTechnologies(companyName: string): void {
    this.isLoadingTech = true;
    this.topTechnologies = [];
    this.cdr.detectChanges();

    this.analyticsService.getMostPopularTechnologiesByCompany(companyName).subscribe({
      next: (rawTechs) => {
        const total = this.totalOffersForRatio || 1;
        this.topTechnologies = rawTechs.map(t => ({
          tech: t.tech,
          frequency: t.frequency,
          percentage: Math.min(100, Math.round((t.frequency / total) * 100))
        }));
        this.isLoadingTech = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania technologii:', err);
        this.isLoadingTech = false;
        this.cdr.detectChanges();
      }
    });
  }

  private recalculateTechPercentages(): void {
    const total = this.totalOffersForRatio;
    if (total > 0 && this.topTechnologies.length > 0) {
      this.topTechnologies = this.topTechnologies.map(t => ({
        ...t,
        percentage: Math.min(100, Math.round((t.frequency / total) * 100))
      }));
    }
  }

  loadSalaryMetrics(companyName: string): void {
    this.isLoadingSalaries = true;
    this.cdr.detectChanges();

    this.analyticsService.compareCompanySalaryWithMarket(companyName).subscribe({
      next: (data) => {
        this.marketComparisonData = data;
        this.buildSalaryComparisonChart(data);
        this.isLoadingSalaries = false;
        this.cdr.detectChanges();
        setTimeout(() => this.salaryChart?.update(), 50);
      },
      error: (err) => {
        console.error('Błąd pobierania porównania płac:', err);
        this.isLoadingSalaries = false;
        this.cdr.detectChanges();
      }
    });

    this.analyticsService.getAverageMonthlySalaryByCompany(companyName).subscribe({
      next: (trend) => {
        this.monthlySalaryTrend = trend;
        this.cdr.detectChanges();
      }
    });
  }

  private buildSalaryComparisonChart(data: CompanyVsMarketSalaryDto[]): void {
    const labels = data.map(d => d.month);

    const companyMid = data.map(d => {
      if (d.companyAvgMin !== null && d.companyAvgMax !== null) return (d.companyAvgMin + d.companyAvgMax) / 2;
      return d.companyAvgMin ?? d.companyAvgMax;
    });

    const marketMid = data.map(d => {
      if (d.globalAvgMin !== null && d.globalAvgMax !== null) return (d.globalAvgMin + d.globalAvgMax) / 2;
      return d.globalAvgMin ?? d.globalAvgMax;
    });

    this.salaryComparisonChartData = {
      labels,
      datasets: [
        {
          label: `${this.selectedCompany()} (Średnia)`,
          data: companyMid,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          tension: 0.35,
          fill: true
        },
        {
          label: 'Rynek Junior IT (Średnia)',
          data: marketMid,
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 2,
          pointBackgroundColor: '#94a3b8',
          tension: 0.35,
          fill: false
        }
      ]
    };
  }

  loadLocations(companyName: string): void {
    this.isLoadingLocations = true;
    this.locationDistribution = [];
    this.cdr.detectChanges();

    this.analyticsService.getLocationDistributionByCompany(companyName).subscribe({
      next: (locations) => {
        this.locationDistribution = locations;
        this.isLoadingLocations = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania lokalizacji:', err);
        this.isLoadingLocations = false;
        this.cdr.detectChanges();
      }
    });
  }

  get companyOverallSalaryRange(): { min: number; max: number; hasData: boolean } {
    const valid = this.monthlySalaryTrend.filter(m => m.avgSalaryMin !== null || m.avgSalaryMax !== null);
    if (valid.length === 0) return { min: 0, max: 0, hasData: false };

    const mins = valid.map(v => v.avgSalaryMin).filter((v): v is number => v !== null);
    const maxs = valid.map(v => v.avgSalaryMax).filter((v): v is number => v !== null);

    const avgMin = mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0;
    const avgMax = maxs.length > 0 ? Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length) : 0;

    return { min: avgMin, max: avgMax, hasData: true };
  }

  get salaryMarketBenchmark(): { diffPercent: number; companyAvg: number; marketAvg: number; hasData: boolean } {
    const validMonths = this.marketComparisonData.filter(
      m => (m.companyAvgMin !== null || m.companyAvgMax !== null) && (m.globalAvgMin !== null || m.globalAvgMax !== null)
    );

    if (validMonths.length === 0) {
      return { diffPercent: 0, companyAvg: 0, marketAvg: 0, hasData: false };
    }

    let cSum = 0;
    let mSum = 0;

    validMonths.forEach(m => {
      const cVal = ((m.companyAvgMin ?? m.companyAvgMax ?? 0) + (m.companyAvgMax ?? m.companyAvgMin ?? 0)) / 2;
      const mVal = ((m.globalAvgMin ?? m.globalAvgMax ?? 0) + (m.globalAvgMax ?? m.globalAvgMin ?? 0)) / 2;
      cSum += cVal;
      mSum += mVal;
    });

    const companyAvg = Math.round(cSum / validMonths.length);
    const marketAvg = Math.round(mSum / validMonths.length);
    const diffPercent = marketAvg > 0 ? Math.round(((companyAvg - marketAvg) / marketAvg) * 100) : 0;

    return { diffPercent, companyAvg, marketAvg, hasData: true };
  }

  loadOffersWithoutSalary(companyName: string): void {
    this.isLoadingWithoutSalary = true;
    this.offersWithoutSalaryCount = null;
    this.cdr.detectChanges();

    this.analyticsService.getOffersWithoutSalaryCount(companyName).subscribe({
      next: (count) => {
        this.offersWithoutSalaryCount = Number(count) || 0;
        this.isLoadingWithoutSalary = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania ofert bez widełek:', err);
        this.offersWithoutSalaryCount = 0;
        this.isLoadingWithoutSalary = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRelistedStats(companyName: string): void {
    this.isLoadingRelisted = true;
    this.cdr.detectChanges();

    this.analyticsService.getCompanyRelistedOffers(companyName).subscribe({
      next: (stats) => {
        this.relistedStats = stats;
        this.isLoadingRelisted = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania statystyk relistingu:', err);
        this.isLoadingRelisted = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadOffers(companyName: string, page: number): void {
    this.isLoadingOffers = true;
    this.cdr.detectChanges();

    this.analyticsService.getCompanyOfferList(companyName, page, this.pageSize).subscribe({
      next: (data) => {
        this.pageData = data;
        this.currentPage = data.number;
        this.isLoadingOffers = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania ofert z backendu:', err);
        this.isLoadingOffers = false;
        this.cdr.detectChanges();
      }
    });
  }

  get totalOffersForRatio(): number {
    if (this.companyDetails?.totalOffersThisYear && this.companyDetails.totalOffersThisYear > 0) {
      return this.companyDetails.totalOffersThisYear;
    }
    if (this.pageData?.totalElements && this.pageData.totalElements > 0) {
      return this.pageData.totalElements;
    }
    return 0;
  }

  get withoutSalaryPercentage(): number {
    const total = this.totalOffersForRatio;
    if (total === 0 || this.offersWithoutSalaryCount === null) return 0;
    return Math.min(100, Math.max(0, Math.round((this.offersWithoutSalaryCount / total) * 100)));
  }

  get withoutSalaryColor(): string {
    const pct = this.withoutSalaryPercentage;
    if (pct >= 50) return '#ef4444';
    if (pct >= 35) return '#f97316';
    if (pct >= 20) return '#eab308';
    return '#10b981';
  }

  getPaletteColor(index: number): string {
    return this.palette[index % this.palette.length];
  }

  getSourceBarColor(sourceName: string): string {
    const s = (sourceName || '').toLowerCase();
    if (s.includes('pracuj')) return '#3b82f6';
    if (s.includes('protocol')) return '#818cf8';
    return '#10b981';
  }

  setBottomTab(tab: 'offers' | 'relisting'): void {
    this.activeBottomTab = tab;
    this.cdr.detectChanges();
  }

  goToPage(page: number): void {
    const company = this.selectedCompany();
    if (!company || !this.pageData) return;
    if (page >= 0 && page < this.pageData.totalPages) {
      this.loadOffers(company, page);
    }
  }

  getPaginationRange(): number[] {
    if (!this.pageData) return [];
    const total = this.pageData.totalPages;
    const current = this.currentPage;
    const maxButtons = 7;

    let start = Math.max(0, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons);

    if (end - start < maxButtons) {
      start = Math.max(0, end - maxButtons);
    }

    const range: number[] = [];
    for (let i = start; i < end; i++) {
      range.push(i);
    }
    return range;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.filteredCompanies = [];
    this.selectedCompany.set(null);
    this.companyDetails = null;
    this.pageData = null;
    this.relistedStats = [];
    this.offersWithoutSalaryCount = null;
    this.topTechnologies = [];
    this.marketComparisonData = [];
    this.monthlySalaryTrend = [];
    this.locationDistribution = [];
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
  }

  openDescriptionModal(offer: OfferSummaryDTO): void {
    this.selectedOfferForModal = offer;
    this.cdr.detectChanges();
  }

  closeDescriptionModal(): void {
    this.selectedOfferForModal = null;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.selectedOfferForModal) {
      this.closeDescriptionModal();
    } else {
      this.isDropdownOpen = false;
    }
    this.cdr.detectChanges();
  }
}