import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import {
  LocationOfferDto,
  SalaryOfferDto,
  TechnologyDto,
  CategoryDto,
  OffersOverviewDto,
  CompanyOffersDTO,
  JobSummaryDTO,
  CompanyDetailsData,
  
} from '../models/market-api.models';

export interface DashboardApiResponse {
  locations: LocationOfferDto[];
  salaries: SalaryOfferDto[];
  technologies: TechnologyDto[];
  categories: CategoryDto[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  
  private readonly baseUrl = 'https://juniorapi.mikrus.dev/api/offers';
  //private readonly baseUrl = 'http://localhost:8080/api/offers';

  getLocations(): Observable<LocationOfferDto[]> {
    return this.http.get<LocationOfferDto[]>(`${this.baseUrl}/countOffersByLocation`);
  }

  getSalaries(): Observable<SalaryOfferDto[]> {
    return this.http.get<SalaryOfferDto[]>(`${this.baseUrl}/averageSalaryByMonth`);
  }

  getTechnologies(): Observable<TechnologyDto[]> {
    return this.http.get<TechnologyDto[]>(`${this.baseUrl}/popularTechnologies`);
  }

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/countOffersByCategory`);
  }

  getDashboardData(): Observable<DashboardApiResponse> {
    return forkJoin({
      locations: this.getLocations(),
      salaries: this.getSalaries(),
      technologies: this.getTechnologies(),
      categories: this.getCategories()
    });
  }

  getOverview() : Observable<OffersOverviewDto> {
    return this.http.get<OffersOverviewDto>(`${this.baseUrl}/overview`);
  }

  getCompanyOffers() : Observable<CompanyOffersDTO[]> {
    return this.http.get<CompanyOffersDTO[]>(`${this.baseUrl}/countCompanyOffers`);
  }
  
  getCompanyLocationOffersMap(): Observable<Record<string, Record<string, number>>> {
    return this.http.get<Record<string, Record<string, number>>>(`${this.baseUrl}/offersAmountByCompanyAndLocation`);
  }

  getCompanyLatestJobs(companyName: string): Observable<JobSummaryDTO[]> {
    return this.http.get<JobSummaryDTO[]>(`${this.baseUrl}/latestJobAdvertisement`, {
      params: { companyName }
    });
  }

  getCompanyTotalOffersThisYear(companyName: string, year: number = new Date().getFullYear()): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/amountOfjobAdvertisements`, {
      params: { companyName, year: year.toString() }
    });
  }

  getCompanySources(companyName: string, year: number = new Date().getFullYear()): Observable<[string, number][]> {
    return this.http.get<[string, number][]>(`${this.baseUrl}/jobAdvertisementSources`, {
      params: { companyName, year }
    });
  }

  getCompanyOffersByCategory(companyName: string): Observable<[string, number][]> {
    return this.http.get<[string, number][]>(`${this.baseUrl}/jobOffersByCategory`, {
      params: { companyName }
    });
  }

getCompanyFullDetails(companyName: string): Observable<CompanyDetailsData> {
    const currentYear = new Date().getFullYear();

    return forkJoin({
      latestOffers: this.getCompanyLatestJobs(companyName),
      totalOffersThisYear: this.getCompanyTotalOffersThisYear(companyName, currentYear),
      sourcesRaw: this.getCompanySources(companyName, currentYear),
      categoriesRaw: this.getCompanyOffersByCategory(companyName)
    }).pipe(
      map(res => {
        console.log('Odpowiedzi z API dla firmy:', res); // <--- Podejrzyj w konsoli co dokładnie przyszło!

        // Bezpieczne parsowanie źródeł
        const rawSources = Array.isArray(res.sourcesRaw) ? res.sourcesRaw : [];
        const totalSources = rawSources.reduce((sum: number, item: any) => {
          const val = Number(Array.isArray(item) ? item[1] : item?.count ?? 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const sources = rawSources.map((item: any) => {
          const name = String(Array.isArray(item) ? item[0] : item?.source ?? 'Inne');
          const count = Number(Array.isArray(item) ? item[1] : item?.count ?? 0);
          const percentage = totalSources > 0 ? Math.round((count / totalSources) * 100) : 0;
          return { source: name, count, percentage };
        });

        // Bezpieczne parsowanie kategorii
        const rawCategories = Array.isArray(res.categoriesRaw) ? res.categoriesRaw : [];
        const categories = rawCategories.map((item: any) => {
          const catName = String(Array.isArray(item) ? item[0] : item?.category ?? 'Inne');
          const count = Number(Array.isArray(item) ? item[1] : item?.count ?? 0);
          return { category: catName, count };
        });

        return {
          latestOffers: Array.isArray(res.latestOffers) ? res.latestOffers : [],
          totalOffersThisYear: Number(res.totalOffersThisYear) || 0,
          sources,
          categories
        };
      })
    );
  }
}