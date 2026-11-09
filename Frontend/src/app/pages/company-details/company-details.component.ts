import { 
  Component, 
  OnInit, 
  inject, 
  signal, 
  ElementRef, 
  HostListener, 
  ChangeDetectorRef, 
  ViewChild, 
  NgZone, 
  ChangeDetectionStrategy 
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
  CompanyDetailsData 
} from '../../core/models/market-api.models';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyDetailsComponent implements OnInit {
  themeService = inject(ThemeService);
  private analyticsService = inject(AnalyticsService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  @ViewChild(BaseChartDirective) donutChart?: BaseChartDirective;

  searchControl = new FormControl('');
  allCompanies: string[] = [];
  filteredCompanies: string[] = [];
  selectedCompany = signal<string | null>(null);
  isDropdownOpen = false;

  companyDetails: CompanyDetailsData | null = null;
  isLoadingDetails = false;

  pageData: SpringPage<OfferSummaryDTO> | null = null;
  currentPage = 0;
  pageSize = 10;
  isLoadingOffers = false;

  relistedStats: RelistedOfferMonthlyDto[] = [];
  isLoadingRelisted = false;

  selectedOfferForModal: OfferSummaryDTO | null = null;

  private palette = [
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#ec4899', '#8b5cf6', '#14b8a6', '#64748b', '#f97316'
  ];

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

  ngOnInit(): void {
    this.analyticsService.getCompanies().subscribe({
      next: (companies) => {
        this.allCompanies = Array.isArray(companies) ? companies.sort() : [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Błąd pobierania listy firm:', err)
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterCompanies(query || '');
      this.cdr.markForCheck();
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

    this.loadCompanyDetails(company);
    this.loadRelistedStats(company);
    this.loadOffers(company, 0);

    this.cdr.markForCheck();
  }

  loadCompanyDetails(companyName: string): void {
    this.isLoadingDetails = true;
    this.cdr.markForCheck();

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

        this.isLoadingDetails = false;
        this.cdr.markForCheck();

        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            this.donutChart?.update();
          }, 0);
        });
      },
      error: (err) => {
        console.error('Błąd pobierania szczegółów pracodawcy:', err);
        this.isLoadingDetails = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadRelistedStats(companyName: string): void {
    this.isLoadingRelisted = true;
    this.cdr.markForCheck();

    this.analyticsService.getCompanyRelistedOffers(companyName).subscribe({
      next: (stats) => {
        this.relistedStats = stats;
        this.isLoadingRelisted = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Błąd pobierania statystyk relistingu:', err);
        this.isLoadingRelisted = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadOffers(companyName: string, page: number): void {
    this.isLoadingOffers = true;
    this.cdr.markForCheck();

    this.analyticsService.getCompanyOfferList(companyName, page, this.pageSize).subscribe({
      next: (data) => {
        this.pageData = data;
        this.currentPage = data.number;
        this.isLoadingOffers = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Błąd pobierania ofert z backendu:', err);
        this.isLoadingOffers = false;
        this.cdr.markForCheck();
      }
    });
  }

  getPaletteColor(index: number): string {
    return this.palette[index % this.palette.length];
  }

  getSourceBarColor(sourceName: string): string {
    const s = (sourceName || '').toLowerCase();
    if (s.includes('pracuj')) {
      return '#3b82f6';
    }
    if (s.includes('protocol')) {
      return '#818cf8';
    }
    return '#10b981';
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
    this.isDropdownOpen = false;
    this.cdr.markForCheck();
  }

  openDescriptionModal(offer: OfferSummaryDTO): void {
    this.selectedOfferForModal = offer;
    this.cdr.markForCheck();
  }

  closeDescriptionModal(): void {
    this.selectedOfferForModal = null;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.cdr.markForCheck();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.selectedOfferForModal) {
      this.closeDescriptionModal();
    } else {
      this.isDropdownOpen = false;
    }
    this.cdr.markForCheck();
  }
}