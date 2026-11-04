import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      
      <!-- 1. NAVBAR NA PEŁNĄ SZEROKOŚĆ (1440px) -->
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

      <!-- 2. GŁÓWNA ZAWARTOŚĆ -->
      <main class="content-container">
        
        <!-- HERO / O PROJEKCIE -->
        <section class="info-card">
          <span class="section-badge">O projekcie</span>
          <h1 class="card-main-title">
            Junior IT Analytics
          </h1>
          <p class="card-description">
            Aplikacja monitoruje i analizuje rynek ogłoszeń pracy dla początkujących programistów i specjalistów IT w Polsce. Jej celem jest dostarczanie przejrzystych danych dotyczących realiów rynkowych: stawek, najczęściej poszukiwanych umiejętności, rozłożenia ofert w miastach oraz pracodawców z największą liczbą wakatów.
          </p>

          <!-- PRZYCISKI KONTAKTU I LINKI -->
          <div class="contact-links-row">
            <a href="https://discord.com/users/890165622741299200"
               target="_blank" 
               rel="noopener noreferrer" 
               class="action-btn discord-btn">
              <span class="btn-icon">&#128172;</span> Napisz do mnie na Discordzie
            </a>

            <a href="https://github.com/Celiek" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="action-btn github-btn">
              <span class="btn-icon">&#128025;</span> Profil GitHub
            </a>

            <a href="https://mikr.us/?r=cd2f17af" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="action-btn mikrus-btn">
              <span class="btn-icon">&#128640;</span> Hosting Mikrus (Reflink)
            </a>
          </div>
        </section>

        <!-- NOWA SEKCJA: AGREGACJA DANYCH I WYKRESY -->
        <section class="info-card">
          <span class="section-badge">Architektura Danych & Analityka</span>
          <h2 class="card-title">Jak agregowane są dane i co prezentują poszczególne wykresy?</h2>
          
          <div class="grid-2col mt-4">
            <!-- Kolumna 1: Backend & Scraping -->
            <div class="subcard">
              <h3 class="subcard-title">&#9881; Backend i potok ETL</h3>
              <p class="subcard-text">
                Dane zbierane są codziennie w godzinach porannych z portali <strong>Pracuj.pl</strong> oraz <strong>theProtocol.it</strong>.
              </p>
              <ul class="styled-list">
                <li><strong>Scraper:</strong> Dedykowany moduł Python scrapuje dane ze wszystkich kategorii po kategorii junior.</li>
                <li><strong>Baza danych:</strong> PostgreSQL z automatycznymi indeksami i procedurą deduplikacji ogłoszeń (ogłoszenia są deduplikowane po adresie url).</li>
                <li><strong>Backend API:</strong> Backend w Java Spring udostępnia dedykowane endpointy analityczne i tworzy raporty.</li>
                <li><strong>Normalizacja zarobków:</strong> Stawki są normalizowane na netto lub brutto zależnie od formy kontraktu (B2B, UoP, UZ), z danych usuwane są wartości które w stawkach godziniowych mają wstawione kwoty miesięczne jako godzinowe i stawki które są stawkami rocznymi nie miesięcznymi.</li>
              </ul>
            </div>

            <!-- Kolumna 2: Mapowanie na wykresy -->
            <div class="subcard">
              <h3 class="subcard-title">&#128202; Prezentacja na wykresach</h3>
              <ul class="styled-list">
                <li><strong>Średnie zarobki w czasie:</strong> Liniowy wykres historycznych median stawek miesięcznych w podziale na typy umów (UoP, B2B, Zlecenie).</li>
                <li><strong>Wymagania technologiczne:</strong> Wykres słupkowy zliczający częstotliwość występowania kluczowych tagów (języki, frameworki, bazy danych), z zakresu wymaganych w ofertach. </li>
                <li><strong>Dystrybucja geograficzna i kategorie:</strong> Lokalizacje są dzielone na regiony oraz na oferty pracy zdalnej, niektóre oferty zawierają więcej niż jedno miejsce pracy wtedy nadal są dzielone na regiony i zaliczane jako oddzielne miejsce pracy.</li>
                <li><strong>Wykres skumulowany pracodawców:</strong> Ranking firm z podziałem na miasta oraz interaktywny panel (Drawer) pokazujący rozkład działów i 10 ostatnich ofert.</li>
                <li><strong>Wykres z geograficznym rozkładem ofert pracodawców pokazuje tylko pracodawców z ilością ofert większą od 5. </strong></li>
              </ul>
            </div>
          </div>
        </section>

        <!-- SIATKA: PROCES I STACK TECHNOLOGICZNY -->
        <div class="grid-2col">
          <!-- Karta: Zbieranie danych -->
          <section class="info-card">
            <span class="section-badge">Proces</span>
            <h2 class="card-title">Zbieranie i Przetwarzanie Danych</h2>
            <p class="card-description">
              Ogłoszenia przechodzą przez mechanizmy odrzucania duplikatów przed zasileniem bazy produkcyjnej.
            </p>
            <ul class="styled-list">
              <li>Cykliczne zbieranie ogłoszeń sterowana przez systemd (codziennie od 8 do 12).</li>
              <li>Standaryzacja stawek walutowych i ujednolicenie nazewnictwa stanowisk.</li>
              <li>Automatyczne dopasowanie do gałęzi IT (Backend, Frontend, DevOps, QA, Data).</li>
            </ul>
          </section>

          <!-- Karta: Stack technologiczny z powiększonymi odznakami -->
          <section class="info-card">
            <span class="section-badge">Stack</span>
            <h2 class="card-title">Użyte Technologie</h2>
            <p class="card-description">
             Architektura oddzielająca warstwę analityczną od interfejsu SPA:
            </p>

            <div class="tech-badges-wrap">
              <span class="tech-badge badge-angular">Angular 18+ (Standalone)</span>
              <span class="tech-badge badge-ts">TypeScript</span>
              <span class="tech-badge badge-chart">Chart.js & ng2-charts</span>
              <span class="tech-badge badge-tailwind">Tailwind CSS</span>
              <span class="tech-badge badge-spring">Java 21 & Spring Boot 3.5</span>
              <span class="tech-badge badge-db">PostgreSQL</span>
              <span class="tech-badge badge-python">Python </span>
              <span class="tech-badge badge-linux">Linux VPS (Mikrus VPS)</span>
            </div>
          </section>
        </div>

      </main>

      <!-- 3. STOPKA (OBNIŻONA NA DÓŁ STRONY) -->
      <footer class="app-footer">
        <div class="footer-container">
          <p class="footer-main">
            <strong>Junior IT Analytics</strong> &bull; Niezależny projekt analityczny do badania trendów rynkowych w Polsce.
          </p>
          <p class="footer-sub">
            Infrastruktura hostowana na serwerze VPS 
            <a href="https://mikr.us/?r=cd2f17af" target="_blank" rel="noopener noreferrer" class="footer-link">
              Mikrus
            </a>.
          </p>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    .about-page {
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

    .theme-toggle-btn:hover {
      background-color: #334155;
      color: #ffffff;
      border-color: #475569;
    }

    .content-container {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      flex: 1 0 auto;
    }

    .info-card {
      background-color: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 1rem;
      padding: 2rem;
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
      line-height: 1.25;
    }

    .card-title {
      font-size: 1.45rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.85rem 0;
    }

    .card-description {
      font-size: 1.05rem;
      color: #cbd5e1;
      line-height: 1.65;
      margin: 0;
      max-width: 1100px;
    }

    .grid-2col {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .grid-2col {
        grid-template-columns: 1fr 1fr;
      }
    }

    .subcard {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 0.75rem;
      padding: 1.5rem;
    }

    .subcard-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.75rem 0;
    }

    .subcard-text {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .styled-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .styled-list li {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.5;
      position: relative;
      padding-left: 1.25rem;
    }

    .styled-list li::before {
      content: "\\2022";
      color: #6366f1;
      font-weight: bold;
      font-size: 1.2rem;
      position: absolute;
      left: 0;
      top: -2px;
    }

    .styled-list li strong {
      color: #ffffff;
    }

    .contact-links-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1.75rem;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 0.65rem;
      text-decoration: none !important;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .discord-btn {
      background-color: #5865F2;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(88, 101, 242, 0.35);
    }
    .discord-btn:hover {
      background-color: #4752c4;
      transform: translateY(-2px);
    }

    .github-btn {
      background-color: #1e293b;
      color: #f8fafc;
      border: 1px solid #334155;
    }
    .github-btn:hover {
      background-color: #334155;
      color: #ffffff;
      transform: translateY(-2px);
    }

    .mikrus-btn {
      background-color: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.4);
    }
    .mikrus-btn:hover {
      background-color: rgba(99, 102, 241, 0.28);
      color: #ffffff;
      transform: translateY(-2px);
    }

    .tech-badges-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    .tech-badge {
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.5rem 0.95rem;
      border-radius: 0.65rem;
      border-width: 1px;
      border-style: solid;
      display: inline-block;
      letter-spacing: 0.01em;
    }

    .badge-angular {
      background-color: rgba(224, 33, 138, 0.12);
      color: #f472b6;
      border-color: rgba(224, 33, 138, 0.35);
    }

    .badge-ts {
      background-color: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.35);
    }

    .badge-chart {
      background-color: rgba(14, 165, 233, 0.12);
      color: #38bdf8;
      border-color: rgba(14, 165, 233, 0.35);
    }

    .badge-tailwind {
      background-color: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.35);
    }

    .badge-spring {
      background-color: rgba(132, 204, 22, 0.12);
      color: #a3e635;
      border-color: rgba(132, 204, 22, 0.35);
    }

    .badge-db {
      background-color: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border-color: rgba(99, 102, 241, 0.35);
    }

    .badge-python {
      background-color: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.35);
    }

    .badge-linux {
      background-color: rgba(148, 163, 184, 0.12);
      color: #e2e8f0;
      border-color: rgba(148, 163, 184, 0.35);
    }

    .app-footer {
      width: 100%;
      border-top: 1px solid #1e293b;
      background-color: #060913;
      padding: 2.25rem 1.5rem;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1440px;
      margin: 0 auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-main {
      font-size: 0.95rem;
      color: #cbd5e1;
      margin: 0;
    }

    .footer-sub {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .footer-link {
      color: #818cf8;
      font-weight: 600;
      text-decoration: none !important;
    }
    .footer-link:hover {
      color: #a5b4fc;
      text-decoration: underline !important;
    }
  `]
})
export class AboutComponent {
  themeService = inject(ThemeService);
}