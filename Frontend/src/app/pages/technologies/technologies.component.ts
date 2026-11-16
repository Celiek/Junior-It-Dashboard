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
import { TechComboDTO, TechCompanionDTO } from '../../core/models/market-api.models';

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './technologies.component.html',
  styleUrls: ['./technologies.component.css']
})
export class TechnologiesComponent implements OnInit {
  themeService = inject(ThemeService);
  private analyticsService = inject(AnalyticsService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(BaseChartDirective) companionsChart?: BaseChartDirective;

  searchControl = new FormControl('');
  allUniqueTechnologies: string[] = [];
  filteredTechnologies: string[] = [];
  selectedTech = signal<string | null>(null);
  isDropdownOpen = false;

  // Szybkie pigułki na start
  quickPickTechnologies: string[] = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'Docker', 'Spring Boot', 'Angular'
  ];

  // Współwystępujące technologie dla wybranej
  companions: TechCompanionDTO[] = [];
  isLoadingCompanions = false;

  // Najpopularniejsze gotowe kombinacje (pary i trójki) na rynku
  selectedComboSize: number = 2;
  topCombinations: TechComboDTO[] = [];
  isLoadingCombos = false;

  // Wykres poziomy słupkowy dla powiązanych technologii
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y', // Wykres poziomy - najlepiej czytelny dla długich nazw technologii
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const idx = ctx.dataIndex;
            const item = this.companions[idx];
            if (!item) return ` ${ctx.parsed.x}%`;
            return ` Występuje w ${item.percentage}% ofert (${item.count} ogłoszeń)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (val) => `${val}%`
        },
        grid: { color: 'rgba(51, 65, 85, 0.35)' }
      },
      y: {
        ticks: {
          color: '#e2e8f0',
          font: { size: 12, weight: 'bold' }
        },
        grid: { display: false }
      }
    }
  };

  ngOnInit(): void {
    // 1. Pobieramy kombinacje (pary), żeby zbudować słownik unikalnych technologii do wyszukiwarki oraz kartę Top Stacków
    this.loadCombinations(2);

    // 2. Nasłuch wyszukiwarki
    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterTechnologies(query || '');
      this.cdr.detectChanges();
    });
  }

  loadCombinations(size: number): void {
    this.selectedComboSize = size;
    this.isLoadingCombos = true;
    this.cdr.detectChanges();

    this.analyticsService.getTopTechnologyCombinations(size, 60).subscribe({
      next: (combos) => {
        this.topCombinations = combos.slice(0, 12);

        // Wyciągamy unikalne nazwy technologii do autouzupełniania
        const techSet = new Set<string>(this.allUniqueTechnologies);
        combos.forEach(c => {
          c.technologies.forEach(t => techSet.add(t));
        });
        this.allUniqueTechnologies = Array.from(techSet).sort((a, b) => a.localeCompare(b));

        // Aktualizujemy szybkie pigułki, jeśli baza ma dane
        if (size === 2 && combos.length >= 4) {
          const topSingle = new Set<string>();
          combos.forEach(c => c.technologies.forEach(t => topSingle.add(t)));
          this.quickPickTechnologies = Array.from(topSingle).slice(0, 8);
        }

        // Jeśli nic jeszcze nie wybrano, automatycznie wybieramy pierwszą najpopularniejszą technologię
        if (!this.selectedTech() && this.quickPickTechnologies.length > 0) {
          this.selectTechnology(this.quickPickTechnologies[0]);
        }

        this.isLoadingCombos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania kombinacji technologii:', err);
        this.isLoadingCombos = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterTechnologies(query: string): void {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      this.filteredTechnologies = [];
      this.isDropdownOpen = false;
      return;
    }

    this.filteredTechnologies = this.allUniqueTechnologies
      .filter(t => t.toLowerCase().includes(trimmed))
      .slice(0, 20);

    this.isDropdownOpen = true;
  }

  onInputFocus(): void {
    if (this.searchControl.value && this.searchControl.value.trim()) {
      this.filterTechnologies(this.searchControl.value);
    }
  }

  selectTechnology(tech: string): void {
    const cleanTech = tech.trim();
    if (!cleanTech) return;

    this.selectedTech.set(cleanTech);
    this.searchControl.setValue(cleanTech, { emitEvent: false });
    this.isDropdownOpen = false;

    this.loadCompanions(cleanTech);
    this.cdr.detectChanges();
  }

  // Pozwala wyszukać nawet jeśli technologii nie ma jeszcze w słowniku podpowiedzi (np. po wciśnięciu Enter)
  onSearchSubmit(): void {
    const val = this.searchControl.value?.trim();
    if (val) {
      this.selectTechnology(val);
    }
  }

  loadCompanions(targetTech: string): void {
    this.isLoadingCompanions = true;
    this.companions = [];
    this.cdr.detectChanges();

    this.analyticsService.getTopCompanionsForTechnology(targetTech, 10).subscribe({
      next: (data) => {
        this.companions = data;
        this.buildBarChart(targetTech, data);
        this.isLoadingCompanions = false;
        this.cdr.detectChanges();
        setTimeout(() => this.companionsChart?.update(), 50);
      },
      error: (err) => {
        console.error('Błąd pobierania powiązanych technologii:', err);
        this.isLoadingCompanions = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildBarChart(targetTech: string, data: TechCompanionDTO[]): void {
    this.barChartData = {
      labels: data.map(d => d.technology),
      datasets: [
        {
          label: `Współwystępowanie z ${targetTech} (%)`,
          data: data.map(d => d.percentage),
          backgroundColor: data.map((_, idx) => 
            idx === 0 ? '#6366f1' : idx < 3 ? '#3b82f6' : 'rgba(99, 102, 241, 0.55)'
          ),
          borderRadius: 6,
          barThickness: 20
        }
      ]
    };
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.filteredTechnologies = [];
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }
}