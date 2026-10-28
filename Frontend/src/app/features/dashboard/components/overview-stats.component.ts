import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersOverviewDto } from '../../../core/models/market-api.models';

@Component({
  selector: 'app-overview-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="overview" class="w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="overview-container">
        
        <!-- Lewa kolumna: Główny licznik -->
        <div class="overview-main">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span class="text-xs uppercase font-bold tracking-wider text-slate-400">
              Baza ogłoszeń
            </span>
          </div>
          <div class="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight my-1">
            {{ overview.totalOffers | number }}
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Zindeksowanych unikalnych ofert z <strong class="text-slate-700 dark:text-slate-200">{{ overview.totalSources }}</strong> portali
          </p>
        </div>

        <!-- Prawa kolumna: Rozkład źródeł -->
        <div class="overview-sources">
          <div class="sources-title">
            Rozkład ofert wg portali:
          </div>

          <div class="sources-list">
            <div 
              *ngFor="let s of overview.sources" 
              class="source-card">
              
              <!-- Nagłówek kafelka z większym fontem i bez białych ramek -->
              <div class="source-header">
                <span class="source-name">
                  {{ s.source }}
                </span>
                <span class="source-count">
                  {{ s.offersAmount | number }} 
                  <span class="source-percent">({{ getPercentage(s.offersAmount) | number:'1.0-0' }}%)</span>
                </span>
              </div>

              <!-- Pasek postępu -->
              <div class="progress-bar-bg">
                <div 
                  class="progress-bar-fill"
                  [style.width.%]="getPercentage(s.offersAmount)">
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .overview-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }

    @media (min-width: 900px) {
      .overview-container {
        flex-direction: row;
        align-items: center;
      }
      .overview-main {
        width: 35%;
        border-right: 1px solid rgba(148, 163, 184, 0.15);
        padding-right: 2rem;
      }
      .overview-sources {
        width: 65%;
        padding-left: 1rem;
      }
    }

    .sources-title {
      font-size: 0.875rem; /* 14px */
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    .sources-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      width: 100%;
    }

    /* KAFELEK PORTALU */
    .source-card {
      background-color: rgba(30, 41, 59, 0.5); /* subtelne ciemne tło */
      border: 1px solid #334155 !important;    /* ciemnoszara ramka zamiast białej */
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.75rem;
    }

    /* NAGŁÓWEK - USUNIĘCIE OBWÓDKI I ZWIĘKSZENIE CZCIONKI */
    .source-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      border: none !important;    /* usuwa białą ramkę z obrazka */
      outline: none !important;
      padding: 0;
      margin: 0;
    }

    /* Nazwa portalu (np. pracuj.pl) */
    .source-name {
      font-size: 1.05rem;          /* ~17px (wyraźnie większa) */
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.01em;
      border: none !important;
    }

    /* Liczba ofert (np. 5,614) */
    .source-count {
      font-size: 1.05rem;          /* ~17px */
      font-weight: 700;
      color: #818cf8;             /* jasny indygo */
      font-family: monospace, ui-monospace, sans-serif;
      border: none !important;
    }

    /* Procent (np. (60%)) */
    .source-percent {
      font-size: 0.85rem;          /* ~13.5px */
      font-weight: 500;
      color: #94a3b8;
      margin-left: 0.25rem;
    }

    /* PASEK POSTĘPU */
    .progress-bar-bg {
      width: 100%;
      height: 7px;
      background-color: #334155;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background-color: #6366f1; /* indygo */
      border-radius: 9999px;
      transition: width 0.5s ease-in-out;
    }
  `]
})
export class OverviewStatsComponent {
  @Input() overview: OffersOverviewDto | null = null;

  getPercentage(amount: number): number {
    if (!this.overview || !this.overview.totalOffers) return 0;
    return Math.round((amount / this.overview.totalOffers) * 100);
  }
}