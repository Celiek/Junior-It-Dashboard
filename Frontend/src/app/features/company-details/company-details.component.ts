import { Component, OnInit, inject, signal, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { OfferSummaryDTO, SpringPage, RelistedOfferMonthlyDto } from '../../core/models/market-api.models';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="company-page min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      
      <!-- NAVBAR -->
      <nav class="app-navbar">
        <div class="navbar-container">
          <div class="navbar-left">
            <a routerLink="/" class="navbar-brand">
              Junior IT <span class="brand-accent">Analytics</span>
            </a>

            <div class="navbar-links">
              <a routerLink="/" 
                 routerLinkActive="active" 
                 [routerLinkActiveOptions]="{ exact: true }"
                 class="nav-item">
                Dashboard
              </a>
              <a routerLink="/companies" 
                 routerLinkActive="active" 
                 class="nav-item">
                Pracodawcy
              </a>
              <a routerLink="/about" 
                 routerLinkActive="active" 
                 class="nav-item">
                O projekcie
              </a>
            </div>
          </div>

          <button type="button" 
                  (click)="themeService.toggleTheme()" 
                  class="theme-toggle-btn"
                  title="Przełącz motyw">
            <span class="theme-icon">&#9680;</span>
            <span class="theme-label">Tryb ciemny / jasny</span>
          </button>
        </div>
      </nav>

      <!-- GŁÓWNA ZAWARTOŚĆ -->
      <main class="content-container">
        
        <!-- KARTA WYSZUKIWARKI -->
        <section class="search-card">
          <span class="section-badge">Baza firm</span>
          <h1 class="card-main-title">Profil Pracodawcy</h1>
          <p class="card-description">
            Wyszukaj firmę, aby sprawdzić powtarzalność publikacji ogłoszeń, wskaźnik ponowionych ofert oraz przejrzeć aktualne wakaty.
          </p>

          <div class="search-box-wrapper" #searchContainer>
            <div class="input-relative">
              <span class="search-icon">&#128269;</span>
              <input 
                type="text" 
                [formControl]="searchControl"
                (focus)="onInputFocus()"
                placeholder="Wpisz nazwę firmy (np. Allegro, Comarch)..."
                class="search-input" />
              
              <button 
                *ngIf="searchControl.value" 
                type="button" 
                (click)="clearSearch()" 
                class="clear-btn" 
                title="Wyczyść">
                &#10005;
              </button>
            </div>

            <!-- DROPDOWN -->
            <div *ngIf="isDropdownOpen && filteredCompanies.length > 0" class="suggestions-dropdown">
              <div class="dropdown-header">
                Znaleziono: {{ filteredCompanies.length }} {{ filteredCompanies.length === 1 ? 'firmę' : 'firm' }}
              </div>
              <ul class="suggestions-list">
                <li 
                  *ngFor="let company of filteredCompanies" 
                  (click)="selectCompany(company)"
                  class="suggestion-item">
                  <span class="company-name">{{ company }}</span>
                  <span class="select-badge">Wybierz &rarr;</span>
                </li>
              </ul>
            </div>

            <div *ngIf="isDropdownOpen && searchControl.value && filteredCompanies.length === 0" class="suggestions-dropdown no-results">
              Nie znaleziono firmy pasującej do zapytania.
            </div>
          </div>
        </section>

        <!-- WYNIKI DLA WYBRANEJ FIRMY -->
        <ng-container *ngIf="selectedCompany()">
          
          <!-- NAGŁÓWEK WYBRANEJ FIRMY -->
          <div class="company-header-bar">
            <div>
              <span class="selected-badge">Wybrany pracodawca</span>
              <h2 class="offers-title">{{ selectedCompany() }}</h2>
            </div>
            <div *ngIf="pageData" class="offers-count-badge">
              Zindeksowane oferty: <strong>{{ pageData.totalElements }}</strong>
            </div>
          </div>

          <!-- 1. TABELA RELISTINGU / POWTARZALNOŚCI OFERT W CZASIE -->
          <section class="section-block">
            <div class="section-heading">
              <div>
                <h3 class="section-title">🔄 Cykliczność i wznawianie ofert (Relisting)</h3>
                <p class="section-subtitle">
                  Zestawienie liczby unikalnych ofert debiutujących na rynku vs ogłoszeń ponawianych w kolejnych miesiącach na podstawie skrótu treści (MD5 hash).
                </p>
              </div>
            </div>

            <div *ngIf="isLoadingRelisted" class="loader-box">
              <div class="spinner"></div>
              <p>Analiza cyklu życia ofert...</p>
            </div>

            <div *ngIf="!isLoadingRelisted && relistedStats.length > 0" class="table-card">
              <div class="table-responsive">
                <table class="styled-table">
                  <thead>
                    <tr>
                      <th>Miesiąc</th>
                      <th style="text-align: right;">Nowe oferty (Brand New)</th>
                      <th style="text-align: right;">Wznowione oferty (Relisted)</th>
                      <th style="text-align: right;">Łącznie zebrane</th>
                      <th style="text-align: right;">Wskaźnik wznowień</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let stat of relistedStats">
                      <td class="font-mono font-bold text-white">
                        📅 {{ stat.month }}
                      </td>
                      <td style="text-align: right;">
                        <span class="badge-new">+{{ stat.brandNewOffers }}</span>
                      </td>
                      <td style="text-align: right;">
                        <span class="badge-relisted">🔄 {{ stat.relistedOffers }}</span>
                      </td>
                      <td style="text-align: right;" class="text-slate-300 font-mono">
                        {{ stat.totalRecords }}
                      </td>
                      <td style="text-align: right;">
                        <div class="ratio-cell">
                          <div class="ratio-bar-bg">
                            <div class="ratio-bar-fill" [style.width.%]="stat.relistRatioPercentage"></div>
                          </div>
                          <span class="ratio-text">{{ stat.relistRatioPercentage }}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div *ngIf="!isLoadingRelisted && relistedStats.length === 0" class="empty-state">
              Brak zidentyfikowanej historii ponawiania ofert dla tej firmy.
            </div>
          </section>

          <!-- 2. GŁÓWNA TABELA OFERT Z PAGINACJĄ -->
          <section class="section-block">
            <div class="section-heading">
              <div>
                <h3 class="section-title">📋 Lista ogłoszeń rekrutacyjnych</h3>
                <p class="section-subtitle">Przegląd ofert ze szczegółowymi wymaganiami oraz odnośnikami do formularzy aplikacyjnych.</p>
              </div>
            </div>

            <div *ngIf="isLoadingOffers" class="loader-box">
              <div class="spinner"></div>
              <p>Pobieranie listy wakatów...</p>
            </div>

            <div *ngIf="!isLoadingOffers && pageData" class="table-card">
              <div class="table-responsive">
                <table class="styled-table">
                  <thead>
                    <tr>
                      <th>Stanowisko</th>
                      <th>Lokalizacja</th>
                      <th>Kategoria</th>
                      <th>Źródło</th>
                      <th style="text-align: center;">Szczegóły</th>
                      <th style="text-align: right;">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let offer of pageData.content">
                      <td class="font-bold text-white max-w-[280px] truncate" [title]="offer.title">
                        {{ offer.title }}
                      </td>
                      <td class="text-slate-400">
                        {{ offer.location || 'Brak danych' }}
                      </td>
                      <td>
                        <span class="cat-badge">{{ offer.category || 'Inne' }}</span>
                      </td>
                      <td class="font-mono text-xs text-slate-400">
                        {{ offer.source }}
                      </td>
                      <td style="text-align: center;">
                        <button 
                          type="button"
                          (click)="openDescriptionModal(offer)"
                          class="desc-btn">
                          📄 Pokaż opis
                        </button>
                      </td>
                      <td style="text-align: right;">
                        <a 
                          [href]="offer.offer_url" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          class="apply-btn">
                          Aplikuj ↗
                        </a>
                      </td>
                    </tr>

                    <tr *ngIf="pageData.content.length === 0">
                      <td colspan="6" class="no-offers">
                        Brak ofert dla tej firmy w wybranym filtrze.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- PRZYCISKI PAGINACJI -->
              <div *ngIf="pageData.totalPages > 1" class="pagination-bar">
                <button 
                  type="button"
                  [disabled]="pageData.first"
                  (click)="goToPage(currentPage - 1)"
                  class="page-nav-btn">
                  Poprzednia
                </button>

                <div class="page-numbers">
                  <button 
                    *ngFor="let p of getPaginationRange()"
                    type="button"
                    [class.active]="p === currentPage"
                    (click)="goToPage(p)"
                    class="page-btn">
                    {{ p + 1 }}
                  </button>
                </div>

                <button 
                  type="button"
                  [disabled]="pageData.last"
                  (click)="goToPage(currentPage + 1)"
                  class="page-nav-btn">
                  Następna
                </button>
              </div>
            </div>
          </section>

        </ng-container>

      </main>

      <!-- MODAL DLA DESCRIPTION -->
      <div *ngIf="selectedOfferForModal" class="modal-backdrop" (click)="closeDescriptionModal()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="modal-badge">{{ selectedOfferForModal.category || 'Oferta pracy' }}</span>
              <h3 class="modal-title">{{ selectedOfferForModal.title }}</h3>
              <p class="modal-subtitle">{{ selectedCompany() }} • {{ selectedOfferForModal.location }}</p>
            </div>
            <button type="button" (click)="closeDescriptionModal()" class="modal-close-btn" title="Zamknij">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <div class="description-text">
              {{ selectedOfferForModal.description || 'Brak treści opisu w ogłoszeniu.' }}
            </div>
          </div>

          <div class="modal-footer">
            <a 
              [href]="selectedOfferForModal.offer_url" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="apply-btn-modal">
              Przejdź do oferty ↗
            </a>
            <button type="button" (click)="closeDescriptionModal()" class="close-btn-modal">
              Zamknij
            </button>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="app-footer">
        <div class="footer-container">
          <p class="footer-main">
            <strong>Junior IT Analytics</strong> &bull; Niezależny projekt analityczny do badania trendów rynkowych w Polsce.
          </p>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    .company-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-navbar {
      position: sticky;
      top: 0;
      z-index: 40;
      width: 100%;
      height: 64px;
      background-color: rgba(11, 17, 32, 0.9);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-bottom: 1px solid #1e293b;
    }

    .navbar-container {
      max-width: 1440px;
      height: 100%;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }

    .navbar-brand {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      text-decoration: none !important;
      letter-spacing: -0.01em;
      cursor: pointer;
    }

    .brand-accent {
      color: #818cf8;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-item {
      font-size: 0.95rem;
      font-weight: 500;
      color: #94a3b8;
      text-decoration: none !important;
      padding: 0.45rem 0.9rem;
      border-radius: 0.5rem;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      color: #ffffff;
      background-color: rgba(30, 41, 59, 0.7);
    }

    .nav-item.active {
      color: #ffffff;
      background-color: rgba(99, 102, 241, 0.18);
      font-weight: 600;
      box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.35);
    }

    .theme-toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.9rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #cbd5e1;
      background-color: rgba(30, 41, 59, 0.7);
      border: 1px solid #334155;
      border-radius: 0.6rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .content-container {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem 1.5rem;
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .search-card {
      background-color: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      padding: 2.5rem;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
    }

    .section-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #818cf8;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .card-main-title {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.85rem 0;
    }

    .card-description {
      font-size: 1.05rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0 0 2rem 0;
      max-width: 800px;
    }

    .search-box-wrapper {
      position: relative;
      max-width: 640px;
    }

    .input-relative {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      font-size: 1.1rem;
      color: #64748b;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: #0f172a;
      border: 1.5px solid #334155;
      border-radius: 0.75rem;
      padding: 0.9rem 2.8rem;
      font-size: 1rem;
      color: #f8fafc;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      background: #131c31;
    }

    .clear-btn {
      position: absolute;
      right: 0.85rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.4rem;
    }
    .clear-btn:hover {
      color: #ffffff;
      background: #1e293b;
    }

    .suggestions-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: #0b1120;
      border: 1px solid #334155;
      border-radius: 0.75rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      max-height: 320px;
      overflow-y: auto;
      z-index: 50;
    }

    .dropdown-header {
      padding: 0.6rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #1e293b;
      background: #0d1527;
    }

    .suggestions-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #131d33;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .suggestion-item:last-child {
      border-bottom: none;
    }
    .suggestion-item:hover {
      background: #1e293b;
    }

    .company-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: #f1f5f9;
    }

    .select-badge {
      font-size: 0.8rem;
      color: #818cf8;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .suggestion-item:hover .select-badge {
      opacity: 1;
    }

    .no-results {
      padding: 1.25rem;
      text-align: center;
      color: #64748b;
      font-size: 0.9rem;
    }

    .company-header-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 1rem;
    }

    .selected-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #38bdf8;
      letter-spacing: 0.05em;
    }

    .offers-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0.25rem 0 0 0;
    }

    .offers-count-badge {
      font-size: 0.85rem;
      color: #94a3b8;
      background: #0b1120;
      border: 1px solid #1e293b;
      padding: 0.4rem 0.85rem;
      border-radius: 0.5rem;
    }
    .offers-count-badge strong {
      color: #818cf8;
      font-family: monospace;
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.25rem 0;
    }

    .section-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }

    .table-card {
      background-color: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    .styled-table th {
      background: #0f172a;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #1e293b;
    }

    .styled-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #131d33;
      background: rgba(11, 17, 32, 0.7);
    }

    .styled-table tr:hover td {
      background: rgba(30, 41, 59, 0.45);
    }

    .badge-new {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 0.4rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-family: monospace;
    }

    .badge-relisted {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 0.4rem;
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      font-family: monospace;
    }

    .ratio-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .ratio-bar-bg {
      width: 70px;
      height: 6px;
      background: #1e293b;
      border-radius: 3px;
      overflow: hidden;
    }

    .ratio-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #ec4899);
      border-radius: 3px;
    }

    .ratio-text {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.8rem;
      color: #e2e8f0;
      width: 38px;
      text-align: right;
    }

    .cat-badge {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      white-space: nowrap;
    }

    .desc-btn {
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .desc-btn:hover {
      background: rgba(99, 102, 241, 0.3);
      color: #ffffff;
    }

    .apply-btn {
      color: #818cf8;
      font-weight: 700;
      text-decoration: none !important;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .apply-btn:hover {
      text-decoration: underline !important;
      color: #a5b4fc;
    }

    .loader-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 0.75rem;
      color: #94a3b8;
    }

    .spinner {
      width: 2.2rem;
      height: 2.2rem;
      border: 3px solid #6366f1;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      padding: 2rem;
      background: rgba(30, 41, 59, 0.25);
      border: 1px dashed #334155;
      border-radius: 0.75rem;
      text-align: center;
      color: #64748b;
      font-size: 0.9rem;
    }

    .no-offers {
      text-align: center;
      padding: 2.5rem;
      color: #64748b;
    }

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1.25rem;
      border-top: 1px solid #1e293b;
      background: #0d1527;
      flex-wrap: wrap;
    }

    .page-nav-btn {
      padding: 0.45rem 0.9rem;
      font-size: 0.75rem;
      font-weight: 600;
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .page-nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .page-nav-btn:not(:disabled):hover {
      background: #334155;
      color: #ffffff;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .page-btn {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      background: #0f172a;
      color: #94a3b8;
      border: 1px solid #1e293b;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .page-btn:hover {
      color: #ffffff;
      border-color: #475569;
    }
    .page-btn.active {
      background: #6366f1;
      color: #ffffff;
      border-color: #6366f1;
      font-weight: 700;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.8);
      backdrop-filter: blur(5px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-panel {
      width: 100%;
      max-width: 800px;
      max-height: 85vh;
      background: #0b1120;
      border: 1px solid #334155;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      background: #0d1527;
    }

    .modal-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #818cf8;
    }

    .modal-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0.25rem 0 0.15rem 0;
    }

    .modal-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .modal-close-btn:hover {
      color: #ffffff;
    }

    .modal-body {
      padding: 1.75rem;
      overflow-y: auto;
      flex: 1;
    }

    .description-text {
      font-size: 0.95rem;
      line-height: 1.75;
      color: #cbd5e1;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .modal-footer {
      padding: 1rem 1.75rem;
      border-top: 1px solid #1e293b;
      background: #060913;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .apply-btn-modal {
      padding: 0.5rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 600;
      background: #6366f1;
      color: #ffffff;
      border-radius: 0.5rem;
      text-decoration: none !important;
    }
    .apply-btn-modal:hover {
      background: #4f46e5;
    }

    .close-btn-modal {
      padding: 0.5rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 600;
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    .close-btn-modal:hover {
      background: #334155;
      color: #ffffff;
    }

    .app-footer {
      width: 100%;
      border-top: 1px solid #1e293b;
      background-color: #060913;
      padding: 2rem 1.5rem;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1440px;
      margin: 0 auto;
      text-align: center;
    }

    .footer-main {
      font-size: 0.9rem;
      color: #94a3b8;
      margin: 0;
    }
  `]
})
export class CompanyDetailsComponent implements OnInit {
  themeService = inject(ThemeService);
  private analyticsService = inject(AnalyticsService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  searchControl = new FormControl('');
  allCompanies: string[] = [];
  filteredCompanies: string[] = [];
  selectedCompany = signal<string | null>(null);
  isDropdownOpen = false;

  // Stan dla ofert paginowanych
  pageData: SpringPage<OfferSummaryDTO> | null = null;
  currentPage = 0;
  pageSize = 10;
  isLoadingOffers = false;

  // Stan dla relisted offers
  relistedStats: RelistedOfferMonthlyDto[] = [];
  isLoadingRelisted = false;

  // Stan modala
  selectedOfferForModal: OfferSummaryDTO | null = null;

  ngOnInit(): void {
    this.analyticsService.getCompanies().subscribe({
      next: (companies) => {
        this.allCompanies = Array.isArray(companies) ? companies.sort() : [];
      },
      error: (err) => console.error('Błąd pobierania listy firm:', err)
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterCompanies(query || '');
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
    this.cdr.detectChanges();

    // 1. Pobieramy statystyki ponowionych ofert
    this.loadRelistedStats(company);

    // 2. Pobieramy paginowaną listę ofert
    this.loadOffers(company, 0);
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
    this.pageData = null;
    this.relistedStats = [];
    this.isDropdownOpen = false;
  }

  openDescriptionModal(offer: OfferSummaryDTO): void {
    this.selectedOfferForModal = offer;
  }

  closeDescriptionModal(): void {
    this.selectedOfferForModal = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.selectedOfferForModal) {
      this.closeDescriptionModal();
    } else {
      this.isDropdownOpen = false;
    }
  }
}