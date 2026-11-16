import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  HostListener, 
  OnChanges, 
  SimpleChanges, 
  ChangeDetectorRef, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartOptions, ChartData, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { CompanyDetailsData } from '../../../core/models/market-api.models';
import { RouterModule } from '@angular/router';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-company-drawer',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterModule],
  template: `
    <ng-container *ngIf="isOpen">
      <!-- Tło blokujące i przyciemniające -->
      <div class="drawer-backdrop" (click)="close()"></div>

      <!-- Szuflada z prawej strony -->
      <aside class="drawer-panel" role="dialog" aria-modal="true">
        
        <!-- NAGŁÓWEK -->
        <div class="drawer-header">
          <div class="header-left-info">
            <span class="header-badge">Szczegóły pracodawcy</span>
            <h3 class="header-title">{{ companyName }}</h3>
          </div>

          <div class="header-actions">
            <a *ngIf="companyName"
               [routerLink]="['/companies']"
               [queryParams]="{ company: companyName }"
               (click)="close()"
               class="full-profile-btn">
              <span>Pełny profil</span>
              <span>&rarr;</span>
            </a>
            <button type="button" (click)="close()" class="close-btn" title="Zamknij panel">✕</button>
          </div>
        </div>

        <!-- LOADER -->
        <div *ngIf="isLoading" class="loader-container">
          <div class="spinner"></div>
          <p>Pobieranie statystyk pracodawcy...</p>
        </div>

        <!-- TREŚĆ GŁÓWNA -->
        <div *ngIf="!isLoading && details" class="drawer-content">
          
          <!-- SEKCJA: KARTY ŹRÓDEŁ I WOLUMENU -->
          <div>
            <h4 class="section-title">Wolumen i źródła ogłoszeń</h4>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-label">Wszystkie w tym roku</span>
                <span class="stat-value">{{ details.totalOffersThisYear | number }}</span>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: 100%;"></div>
                </div>
              </div>

              <div *ngFor="let src of details.sources" class="stat-card">
                <div class="stat-card-header">
                  <span class="stat-source-name">{{ src.source }}</span>
                  <span class="stat-source-meta">{{ src.count | number }} ({{ src.percentage }}%)</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" [style.width.%]="src.percentage"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- SEKCJA: WYKRES ROZKŁADU KATEGORII -->
          <div class="category-section">
            <h4 class="section-title">Rozkład ofert według kategorii</h4>
            
            <div class="category-layout" *ngIf="hasChartData; else noCategories">
              <div class="chart-wrapper">
                <canvas baseChart
                  [data]="pieChartData"
                  [options]="pieChartOptions"
                  [type]="'doughnut'">
                </canvas>
              </div>

              <div class="category-list">
                <div *ngFor="let cat of formattedCategories; let i = index" class="category-item">
                  <div class="category-item-left">
                    <span class="color-dot" [style.background-color]="getPieColor(i)"></span>
                    <span class="category-name" [title]="cat.fullCategory">{{ cat.cleanCategory }}</span>
                  </div>
                  <span class="category-count">{{ cat.count }}</span>
                </div>
              </div>
            </div>

            <ng-template #noCategories>
              <div class="empty-state">Brak sprecyzowanych kategorii dla tej firmy.</div>
            </ng-template>
          </div>

          <!-- SEKCJA: TABELA NAJNOWSZYCH OGŁOSZEŃ -->
          <div>
            <h4 class="section-title">Ostatnie ogłoszenia (max 10)</h4>
            <div class="table-container">
              <table class="jobs-table">
                <thead>
                  <tr>
                    <th>Stanowisko</th>
                    <th>Lokalizacja</th>
                    <th>Kategoria</th>
                    <th style="text-align: center;">Portal</th>
                    <th style="text-align: right;">Link</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let job of details.latestOffers">
                    <td class="col-title" [title]="job.title">{{ job.title }}</td>
                    <td class="col-muted">{{ job.location || 'Brak' }}</td>
                    <td>
                      <span class="badge-tag">{{ job.category || 'Inne' }}</span>
                    </td>
                    <td style="text-align: center;" class="col-muted font-mono">{{ job.source }}</td>
                    <td style="text-align: right;">
                      <a [href]="job.offer_url" target="_blank" rel="noopener noreferrer" class="apply-link">
                        Aplikuj ↗
                      </a>
                    </td>
                  </tr>
                  <tr *ngIf="details.latestOffers.length === 0">
                    <td colspan="5" class="empty-state">Brak zarejestrowanych ogłoszeń.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- STOPKA -->
        <div class="drawer-footer">
          <button type="button" (click)="close()" class="footer-btn">Zamknij</button>
          <a *ngIf="companyName"
             [routerLink]="['/companies']"
             [queryParams]="{ company: companyName }"
             (click)="close()"
             class="full-profile-btn">
            <span>Analiza zarobków, stacku i relistingu</span>
            <span>&rarr;</span>
          </a>
        </div>

      </aside>
    </ng-container>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(2, 6, 23, 0.75);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      z-index: 9998;
    }

    .drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      height: 100vh;
      width: 100%;
      max-width: 680px;
      background-color: #0b1120;
      border-left: 1px solid #1e293b;
      box-shadow: -12px 0 35px rgba(0, 0, 0, 0.65);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      color: #f8fafc;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 1.5rem;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-shrink: 0;
    }

    .header-left-info {
      min-width: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .header-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #818cf8;
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 0.25rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .full-profile-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.55rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #ffffff;
      background-color: #4f46e5;
      border: 1px solid #6366f1;
      border-radius: 0.55rem;
      text-decoration: none;
      white-space: nowrap;
      transition: background-color 0.15s ease, transform 0.1s ease;
    }

    .full-profile-btn:hover {
      background-color: #6366f1;
    }

    .close-btn {
      padding: 0.5rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      border-radius: 0.5rem;
      transition: background 0.15s, color 0.15s;
    }
    .close-btn:hover {
      background: #1e293b;
      color: #ffffff;
    }

    .loader-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      gap: 0.75rem;
    }

    .spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 4px solid #6366f1;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
    }

    .stat-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      font-family: monospace;
      color: #ffffff;
      margin-top: 0.25rem;
    }

    .stat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .stat-source-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: #ffffff;
    }

    .stat-source-meta {
      font-family: monospace;
      font-size: 0.875rem;
      color: #818cf8;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background: #334155;
      border-radius: 9999px;
      margin-top: 0.75rem;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #6366f1;
      border-radius: 9999px;
      transition: width 0.4s ease;
    }

    .category-section {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 1.25rem;
    }

    .category-layout {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    @media (min-width: 640px) {
      .category-layout {
        flex-direction: row;
        align-items: center;
      }
    }

    .chart-wrapper {
      position: relative;
      width: 170px;
      height: 170px;
      flex-shrink: 0;
    }

    .category-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;
      padding-right: 0.35rem;
    }

    .category-list::-webkit-scrollbar {
      width: 5px;
    }
    .category-list::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }

    .category-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 0.5rem;
      padding: 0.35rem 0.6rem;
      font-size: 0.75rem;
    }

    .category-item-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      flex: 1;
    }

    .color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .category-name {
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category-count {
      font-family: monospace;
      font-weight: 700;
      color: #f8fafc;
      margin-left: 0.75rem;
      flex-shrink: 0;
    }

    .table-container {
      overflow-x: auto;
      border: 1px solid #334155;
      border-radius: 0.75rem;
    }

    .jobs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
      text-align: left;
    }

    .jobs-table th {
      background: #1e293b;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.65rem;
      letter-spacing: 0.05em;
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid #334155;
    }

    .jobs-table td {
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid #1e293b;
      background: rgba(15, 23, 42, 0.7);
    }

    .jobs-table tr:hover td {
      background: rgba(30, 41, 59, 0.5);
    }

    .col-title {
      font-weight: 600;
      color: #ffffff;
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .col-muted {
      color: #94a3b8;
      white-space: nowrap;
    }

    .badge-tag {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      font-size: 0.65rem;
      white-space: nowrap;
    }

    .apply-link {
      color: #818cf8;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }
    .apply-link:hover {
      text-decoration: underline;
      color: #a5b4fc;
    }

    .empty-state {
      text-align: center;
      padding: 1.5rem;
      color: #64748b;
      font-size: 0.75rem;
    }

    .drawer-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #1e293b;
      background: #020617;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .footer-btn {
      padding: 0.55rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-radius: 0.55rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .footer-btn:hover {
      background: #334155;
    }
  `]
})
export class CompanyDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() companyName: string | null = null;
  @Input() isLoading = false;
  @Input() details: CompanyDetailsData | null = null;
  @Output() closed = new EventEmitter<void>();

  private cdr = inject(ChangeDetectorRef);
  hasChartData = false;

  formattedCategories: { cleanCategory: string; fullCategory: string; count: number }[] = [];

  private palette: string[] = [
    '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'
  ];

  public pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} ofert`
        }
      }
    }
  };

  public pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['details'] && this.details) {
      this.updatePieChart();
    }
    this.cdr.detectChanges();
  }

  getPieColor(index: number): string {
    return this.palette[index % this.palette.length];
  }

  private cleanCategoryName(name: string): string {
    if (!name) return 'Inne';
    if (name.includes('>')) {
      const parts = name.split('>');
      return parts[parts.length - 1].trim();
    }
    return name.replace(/^IT\s*-\s*/i, '').trim();
  }

  private updatePieChart(): void {
    if (!this.details?.categories || this.details.categories.length === 0) {
      this.hasChartData = false;
      this.formattedCategories = [];
      return;
    }

    const sorted = [...this.details.categories].sort((a, b) => b.count - a.count);

    this.formattedCategories = sorted.map(c => ({
      cleanCategory: this.cleanCategoryName(c.category),
      fullCategory: c.category,
      count: c.count
    }));

    this.pieChartData = {
      labels: this.formattedCategories.map(c => c.cleanCategory),
      datasets: [{
        data: this.formattedCategories.map(c => c.count),
        backgroundColor: this.formattedCategories.map((_, i) => this.getPieColor(i)),
        borderColor: '#0b1120',
        borderWidth: 2
      }]
    };
    this.hasChartData = true;
    this.cdr.detectChanges();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}