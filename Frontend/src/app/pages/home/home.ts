import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import {
  ChartDataService,
  JobTechnologyStats,
  JobLocationStats,
  AverageSalaryByContractStats,
} from '../../services/chart-data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  // =========================================================
  // TYTUŁY
  // =========================================================

  public locationChartTitle = 'Oferty pracy według lokalizacji';

  public technologyChartTitle =
    'Najpopularniejsze technologie w ofertach pracy';

  public salaryChartTitle =
    'Średnie zarobki według rodzaju umowy i miesiąca';

  public offersByCategoryChartTitle =
    'Oferty pracy według kategorii';


  // =========================================================
  // TYPY WYKRESÓW
  // =========================================================

  public locationChartType: 'bar' = 'bar';

  public technologyChartType: 'bar' = 'bar';

  public salaryChartType: 'bar' = 'bar';

  public offersByCategoryChartType: 'bar' = 'bar';


  // =========================================================
  // STANY ŁADOWANIA
  // =========================================================

  public isLocationLoading = true;

  public isTechnologyLoading = true;

  public isSalaryLoading = true;

  public isCategoryLoading = true;


  // =========================================================
  // DANE WYKRESÓW
  // =========================================================

  public locationChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  public technologyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  public salaryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  public offersByCategoryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };


  // =========================================================
  // KATEGORIE
  // =========================================================

  public allCategoriesRaw: {
    name: string;
    count: number;
  }[] = [];

  public categoryLimit = 15;

  public maxCategoryLimit = 75;


  // =========================================================
  // WYSOKOŚĆ WYKRESÓW
  // =========================================================

  get locationChartHeight(): string {

    const count =
      this.locationChartData.labels?.length ?? 0;

    return `${Math.max(400, count * 32)}px`;
  }


  get technologyChartHeight(): string {

    const count =
      this.technologyChartData.labels?.length ?? 0;

    return `${Math.max(400, count * 32)}px`;
  }


  get offersByCategoryChartHeight(): string {

    const count =
      this.offersByCategoryChartData.labels?.length ?? 0;

    return `${Math.max(350, count * 34)}px`;
  }


  // =========================================================
  // OPCJE - LOKALIZACJE
  // =========================================================

  public locationChartOptions: ChartConfiguration<'bar'>['options'] = {

    responsive: true,

    maintainAspectRatio: false,

    indexAxis: 'y',

    plugins: {

      legend: {
        display: false,
      },

      title: {
        display: true,
        text: 'Oferty pracy według lokalizacji',
      },
    },

    scales: {

      x: {
        beginAtZero: true,
      },

      y: {
        ticks: {
          autoSkip: false,
        },
      },
    },
  };


  // =========================================================
  // OPCJE - TECHNOLOGIE
  // =========================================================

  public technologyChartOptions: ChartConfiguration<'bar'>['options'] = {

    responsive: true,

    maintainAspectRatio: false,

    indexAxis: 'y',

    plugins: {

      legend: {
        display: false,
      },

      title: {
        display: true,
        text: 'Oferty pracy według technologii',
      },
    },

    scales: {

      x: {
        beginAtZero: true,
      },

      y: {
        ticks: {
          autoSkip: false,
        },
      },
    },
  };


  // =========================================================
  // OPCJE - WYNAGRODZENIA
  // =========================================================

  public salaryChartOptions: ChartConfiguration<'bar'>['options'] = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: true,
        position: 'top',
      },

      title: {

        display: true,

        text:
          'Średnie miesięczne zarobki brutto (stawki godzinowe przeliczone na 168h)',
      },

      tooltip: {

        callbacks: {

          label: context => {

            const value = context.parsed.y;

            if (value === null || value === undefined) {

              return `${context.dataset.label}: brak danych`;
            }

            return `${context.dataset.label}: ${Number(value).toLocaleString('pl-PL')} zł`;
          },
        },
      },
    },

    scales: {

      y: {

        beginAtZero: true,

        ticks: {

          callback: value =>
            `${Number(value).toLocaleString('pl-PL')} zł`,
        },
      },

      x: {

        ticks: {

          autoSkip: false,

          maxRotation: 45,

          minRotation: 50,
        },
      },
    },
  };


  // =========================================================
  // OPCJE - KATEGORIE
  // =========================================================

  public offersByCategoryChartOptions:
    ChartConfiguration<'bar'>['options'] = {

    responsive: true,

    maintainAspectRatio: false,

    indexAxis: 'y',

    plugins: {

      legend: {
        display: false,
      },

      title: {

        display: true,

        text: 'Oferty pracy według kategorii',
      },
    },

    scales: {

      x: {
        beginAtZero: true,
      },

      y: {

        ticks: {
          autoSkip: false,
        },
      },
    },
  };


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private chartDataService: ChartDataService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log('======================');
  console.log('HOME INITIALIZED');
  console.log('======================');

    this.loadLocationChart();

    this.loadTechnologyChart();

    this.loadSalaryChart();

    this.loadOffersByCategoryChart();
    
  }


  // =========================================================
  // 1. LOKALIZACJE
  // =========================================================

  private loadLocationChart(): void {

    this.isLocationLoading = true;

    this.chartDataService.getOffersByLocation().subscribe({

      next: (response: JobLocationStats[]) => {

        console.log(
          'Dane lokalizacji z API:',
          response
        );

        const topLocations = (response ?? [])

          .filter(item =>
            item.location &&
            item.liczba_ofert != null
          )

          .sort(
            (a, b) =>
              Number(b.liczba_ofert) -
              Number(a.liczba_ofert)
          )

          .slice(0, 30);


        this.locationChartData = {

          labels:
            topLocations.map(item => item.location),

          datasets: [

            {
              label: 'Liczba ofert',

              data:
                topLocations.map(
                  item => Number(item.liczba_ofert)
                ),
            },
          ],
        };


        this.isLocationLoading = false;
        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Błąd pobierania lokalizacji:',
          error
        );

        this.isLocationLoading = false;

        this.locationChartTitle =
          'Nie udało się pobrać danych lokalizacji';
      },
    });
  }


  // =========================================================
  // 2. TECHNOLOGIE
  // =========================================================

  private loadTechnologyChart(): void {

    this.isTechnologyLoading = true;

    this.chartDataService.getOffersByTechnology().subscribe({

      next: (response: JobTechnologyStats[]) => {

        console.log(
          'Dane technologii z API:',
          response
        );


        const topTechnologies = (response ?? [])

          .filter(item =>
            item.technology &&
            item.count != null
          )

          .sort(
            (a, b) =>
              Number(b.count) -
              Number(a.count)
          )

          .slice(0, 100);


        console.log(
          'Top technologie:',
          topTechnologies
        );


        this.technologyChartData = {

          labels:
            topTechnologies.map(
              item => item.technology
            ),

          datasets: [

            {
              label: 'Liczba ofert',

              data:
                topTechnologies.map(
                  item => Number(item.count)
                ),
            },
          ],
        };


        this.isTechnologyLoading = false;
        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Błąd pobierania technologii:',
          error
        );

        this.isTechnologyLoading = false;

        this.technologyChartTitle =
          'Nie udało się pobrać danych technologii';
      },
    });
  }


  // =========================================================
  // 3. WYNAGRODZENIA
  // =========================================================

  private loadSalaryChart(): void {

    this.isSalaryLoading = true;

    this.chartDataService
      .getAverageSalaryByContractType()
      .subscribe({

        next: (
          response: AverageSalaryByContractStats[]
        ) => {

          console.log(
            'Dane wynagrodzeń z API:',
            response
          );


          const validRecords: {
            month: string;
            contract: string;
            salary: number;
            count: number;
          }[] = [];


          for (const item of response ?? []) {

            if (
              !item.month ||
              item.averageSalary == null
            ) {
              continue;
            }


            let salary =
              Number(item.averageSalary);


            const typeStr =
              (item.contractType ?? '').toLowerCase();


            /*
             * Jeżeli backend zwraca stawkę godzinową,
             * przeliczamy ją na 168 godzin miesięcznie.
             */

            if (
              typeStr.includes('godz') ||
              typeStr.includes('/ hr') ||
              salary < 400
            ) {

              salary *= 168;
            }


            const normalizedContract =
              this.normalizeContractType(
                item.contractType
              );


            if (normalizedContract) {

              validRecords.push({

                month: item.month,

                contract: normalizedContract,

                salary: salary,

                count:
                  Number(item.offersCount) || 1,
              });
            }
          }


          if (validRecords.length === 0) {

            this.salaryChartData = {
              labels: [],
              datasets: [],
            };

            this.isSalaryLoading = false;

            return;
          }


          // Wszystkie miesiące

          const months = Array.from(
            new Set(
              validRecords.map(
                record => record.month
              )
            )
          )
            .sort(
              (a, b) =>
                new Date(a).getTime() -
                new Date(b).getTime()
            );


          // Rodzaje umów

          const contractsToShow = [

            'Umowa o pracę',

            'B2B',

            'Umowa zlecenie',

          ];


          // Dane wykresu

          const datasets =
            contractsToShow.map(
              contract => {

                const data =
                  months.map(month => {

                    const matches =
                      validRecords.filter(
                        record =>
                          record.month === month &&
                          record.contract === contract
                      );


                    if (matches.length === 0) {

                      return null;
                    }


                    /*
                     * Średnia ważona liczbą ofert.
                     */

                    const totalWeightedSalary =
                      matches.reduce(
                        (sum, record) =>
                          sum +
                          record.salary *
                          record.count,

                        0
                      );


                    const totalOffers =
                      matches.reduce(
                        (sum, record) =>
                          sum + record.count,

                        0
                      );


                    return Math.round(
                      totalWeightedSalary /
                      totalOffers
                    );
                  });


                return {

                  label: contract,

                  data: data,
                };
              }
            );


          this.salaryChartData = {

            labels:
              months.map(
                month => this.formatMonth(month)
              ),

            datasets: datasets,
          };


          this.isSalaryLoading = false;
          this.cdr.detectChanges(); 
        },

        error: error => {

          console.error(
            'Błąd pobierania wynagrodzeń:',
            error
          );

          this.isSalaryLoading = false;

          this.salaryChartTitle =
            'Nie udało się pobrać danych o zarobkach';
        },
      });
  }


  // =========================================================
  // NORMALIZACJA RODZAJU UMOWY
  // =========================================================

  private normalizeContractType(
    type: string
  ): string | null {

    if (!type) {
      return null;
    }


    const value =
      type.toLowerCase();


    if (value.includes('b2b')) {

      return 'B2B';
    }


    if (
      value.includes('prac') ||
      value.includes('employment') ||
      value.includes('uop') ||
      value.includes('coe')
    ) {

      return 'Umowa o pracę';
    }


    if (
      value.includes('zlec') ||
      value.includes('mandate') ||
      value.includes('com')
    ) {

      return 'Umowa zlecenie';
    }


    if (
      value.includes('dzieło') ||
      value.includes('cfsw') ||
      value.includes('uod')
    ) {

      return 'Umowa o dzieło';
    }


    if (
      value.includes('staż') ||
      value.includes('praktyk') ||
      value.includes('internship')
    ) {

      return 'Staż / Praktyki';
    }


    return null;
  }


  // =========================================================
  // 4. KATEGORIE
  // =========================================================

  private loadOffersByCategoryChart(): void {

    this.isCategoryLoading = true;

    this.chartDataService
      .getOffersByCategory()
      .subscribe({

        next: (response: any[]) => {

          console.log(
            'Dane kategorii z API:',
            response
          );


          if (
            !Array.isArray(response) ||
            response.length === 0
          ) {

            this.offersByCategoryChartData = {
              labels: [],
              datasets: [],
            };

            this.isCategoryLoading = false;

            return;
          }


          this.allCategoriesRaw = response

            .map(item => ({

              name: String(
                item.category ??
                item.name ??
                item.kategoria ??
                item.title ??
                ''
              ).trim(),

              count: Number(
                item.count ??
                item.liczba_ofert ??
                item.offersCount ??
                0
              ),
            }))

            .filter(
              item =>
                item.name.length > 0 &&
                item.count > 0
            )

            .sort(
              (a, b) =>
                b.count - a.count
            );


          this.maxCategoryLimit =
            Math.min(
              this.allCategoriesRaw.length,
              100
            );


          this.categoryLimit =
            Math.min(
              this.categoryLimit,
              this.maxCategoryLimit
            );


          this.updateCategoryChart();

          this.isCategoryLoading = false;
          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'Błąd pobierania kategorii:',
            error
          );

          this.isCategoryLoading = false;

          this.offersByCategoryChartTitle =
            'Nie udało się pobrać danych o kategoriach';
        },
      });
  }


  // =========================================================
  // SLIDER KATEGORII
  // =========================================================

  public onCategoryLimitChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    this.categoryLimit =
      Number(input.value);


    this.updateCategoryChart();
  }


  private updateCategoryChart(): void {

    const sliced =
      this.allCategoriesRaw.slice(
        0,
        this.categoryLimit
      );


    this.offersByCategoryChartData = {

      labels:
        sliced.map(
          item => item.name
        ),

      datasets: [

        {

          label: 'Liczba ofert',

          data:
            sliced.map(
              item => item.count
            ),

          backgroundColor: '#3b82f6',

          borderRadius: 4,
        },
      ],
    };
  }


  // =========================================================
  // FORMATOWANIE MIESIĄCA
  // =========================================================

  private formatMonth(
    month: string
  ): string {

    return new Intl.DateTimeFormat(
      'pl-PL',
      {
        month: 'short',
        year: 'numeric',
      }
    ).format(
      new Date(month)
    );
  }
}