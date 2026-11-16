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
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  CompanyLocationDto,
  ContractSalaryTrendItem
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('donutChart', { read: BaseChartDirective }) donutChart?: BaseChartDirective;
  @ViewChild('salaryChart', { read: BaseChartDirective }) salaryChart?: BaseChartDirective;

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

  rawContractSalaries: ContractSalaryTrendItem[] = [];
  salaryUnitMode: 'monthly' | 'hourly' = 'monthly';
  hasHourlyRates = false;
  hasMonthlyRates = false;

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

    this.route.queryParamMap.subscribe(params => {
      const companyFromUrl = params.get('company')?.trim();
      if (companyFromUrl && companyFromUrl !== this.selectedCompany()) {
        this.loadDataForCompany(companyFromUrl);
      }
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { company },
      queryParamsHandling: 'merge'
    });
    this.loadDataForCompany(company);
  }

  private loadDataForCompany(company: string): void {
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
  this.rawContractSalaries = [];
  this.cdr.detectChanges();

  this.analyticsService.getCompanySalaryByContract(companyName).subscribe({
    next: (items) => {
      this.rawContractSalaries = items;
      this.detectAvailableSalaryUnits(items);
      this.buildContractSalaryChart();
      this.isLoadingSalaries = false;
      this.cdr.detectChanges();
      setTimeout(() => this.salaryChart?.update(), 50);
    },
    error: (err) => {
      console.error('Błąd pobierania stawek wg umów:', err);
      this.isLoadingSalaries = false;
      this.cdr.detectChanges();
    }
  });
}

setSalaryUnitMode(mode: 'monthly' | 'hourly'): void {
  this.salaryUnitMode = mode;
  this.buildContractSalaryChart();
  this.cdr.detectChanges();
  setTimeout(() => this.salaryChart?.update(), 50);
}

private isHourlyRecord(item: ContractSalaryTrendItem): boolean {
  const ct = item.contractType.toLowerCase();
  return ct.includes('godz') || ct.includes('hr') || (item.averageSalary > 0 && item.averageSalary < 500);
}

private normalizeContractGroup(contractType: string): 'B2B' | 'UoP' | 'UZ / Inne' {
  const ct = contractType.toLowerCase();
  if (ct.includes('b2b')) return 'B2B';
  if (ct.includes('prac') || ct.includes('uop') || ct.includes('employment') || ct.includes('coe')) return 'UoP';
  return 'UZ / Inne';
}

private detectAvailableSalaryUnits(items: ContractSalaryTrendItem[]): void {
  this.hasHourlyRates = items.some(i => this.isHourlyRecord(i));
  this.hasMonthlyRates = items.some(i => !this.isHourlyRecord(i));

  // Jeśli firma ma wyłącznie stawki godzinowe (jak B2B.NET w ostatnich miesiącach), przełącz automatycznie na godzinowe
  if (!this.hasMonthlyRates && this.hasHourlyRates) {
    this.salaryUnitMode = 'hourly';
  } else {
    this.salaryUnitMode = 'monthly';
  }
}

private buildContractSalaryChart(): void {
  // 1. Filtrujemy rekordy zgodne z wybranym trybem (miesięczne vs godzinowe)
  const filtered = this.rawContractSalaries.filter(item =>
    this.salaryUnitMode === 'hourly' ? this.isHourlyRecord(item) : !this.isHourlyRecord(item)
  );

  // 2. Zbieramy posortowaną listę wszystkich unikalnych miesięcy z pełnego zbioru danych
  const allMonths = Array.from(new Set(this.rawContractSalaries.map(i => i.month))).sort();

  // 3. Agregujemy średnią ważoną (po offersCount) dla każdej grupy umowy w każdym miesiącu
  const computeSeries = (groupName: 'B2B' | 'UoP' | 'UZ / Inne'): (number | null)[] => {
    return allMonths.map(month => {
      const matching = filtered.filter(
        i => i.month === month && this.normalizeContractGroup(i.contractType) === groupName
      );
      if (matching.length === 0) return null;

      const totalOffers = matching.reduce((sum, x) => sum + (x.offersCount || 1), 0);
      const weightedSum = matching.reduce((sum, x) => sum + x.averageSalary * (x.offersCount || 1), 0);
      return Math.round((weightedSum / totalOffers) * 100) / 100;
    });
  };

  const b2bData = computeSeries('B2B');
  const uopData = computeSeries('UoP');
  const uzData = computeSeries('UZ / Inne');

  const unitLabel = this.salaryUnitMode === 'hourly' ? 'zł/h' : 'PLN';

  // Aktualizacja osi Y oraz tooltipów pod wybraną jednostkę
  if (this.salaryComparisonChartOptions?.scales?.['y']?.ticks) {
    this.salaryComparisonChartOptions.scales['y'].ticks.callback = (val) => `${val} ${unitLabel}`;
  }
  if (this.salaryComparisonChartOptions?.plugins?.tooltip?.callbacks) {
    this.salaryComparisonChartOptions.plugins.tooltip.callbacks.label = (ctx) => {
      const val = ctx.parsed.y;
      return val !== null ? ` ${ctx.dataset.label}: ${val} ${unitLabel}` : ` ${ctx.dataset.label}: brak danych`;
    };
  }

  this.salaryComparisonChartData = {
    labels: allMonths,
    datasets: [
      {
        label: 'Kontrakt B2B',
        data: b2bData,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.12)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Umowa o Pracę (UoP)',
        data: uopData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
        tension: 0.3,
        fill: false
      },
      {
        label: 'UZ / Staż / Inne',
        data: uzData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderDash: [4, 4],
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#f59e0b',
        tension: 0.3,
        fill: false
      }
    ]
  };
}

// Gettery podsumowujące średnie dla kafelków nad wykresem
get contractAveragesSummary(): { b2b: number | null; uop: number | null; uz: number | null; unit: string } {
  const filtered = this.rawContractSalaries.filter(item =>
    this.salaryUnitMode === 'hourly' ? this.isHourlyRecord(item) : !this.isHourlyRecord(item)
  );

  const calcAvg = (group: 'B2B' | 'UoP' | 'UZ / Inne'): number | null => {
    const list = filtered.filter(i => this.normalizeContractGroup(i.contractType) === group);
    if (list.length === 0) return null;
    const totalOffers = list.reduce((s, x) => s + (x.offersCount || 1), 0);
    const sum = list.reduce((s, x) => s + x.averageSalary * (x.offersCount || 1), 0);
    return Math.round(sum / totalOffers);
  };

  return {
    b2b: calcAvg('B2B'),
    uop: calcAvg('UoP'),
    uz: calcAvg('UZ / Inne'),
    unit: this.salaryUnitMode === 'hourly' ? 'zł/h' : 'PLN'
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { company: null },
      queryParamsHandling: 'merge'
    });

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