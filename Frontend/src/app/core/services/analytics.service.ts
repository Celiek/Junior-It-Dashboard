import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  SpringPage, 
  OfferSummaryDTO,
  RelistedOfferMonthlyDto,
  CompanyMonthlySalaryDto,
  CompanyVsMarketSalaryDto,
  CompanyLocationDto
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
  
  //private readonly baseUrl = 'https://juniorapi.mikrus.dev/api/offers';
  private readonly baseUrl = 'http://localhost:8080/api/offers';

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
          //console.log('Odpowiedzi z API dla firmy:', res); // <--- Podejrzyj w konsoli co dokładnie przyszło!

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

  getCompanies() : Observable<string[] > {
    return this.http.get<string[]>(`${this.baseUrl}/companies`);
  }

  getCompanyOfferList(companyName: string, page: number = 0, size: number = 10): Observable<SpringPage<OfferSummaryDTO>> {
    const params = new HttpParams()
      .set('companyName', companyName)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<SpringPage<OfferSummaryDTO>>(`${this.baseUrl}/companyOfferList`, { params });
  }

  getCompanyRelistedOffers(companyName: string): Observable<RelistedOfferMonthlyDto[]> {
    const params = new HttpParams().set('companyName', companyName);

    return this.http.get<any[][]>(`${this.baseUrl}/relistedoffers`, { params }).pipe(
      map((rows) => {
        if (!Array.isArray(rows)) return [];
        return rows.map((row) => {
          const month = String(row[0]);
          const brandNew = Number(row[1]) || 0;
          const relisted = Number(row[2]) || 0;
          const total = Number(row[3]) || (brandNew + relisted);
          const relistRatio = total > 0 ? Math.round((relisted / total) * 100) : 0;

          return {
            month,
            brandNewOffers: brandNew,
            relistedOffers: relisted,
            totalRecords: total,
            relistRatioPercentage: relistRatio
          };
        });
      })
    );
  }

  getOffersWithoutSalaryCount(companyName: string): Observable<number> {
    const params = new HttpParams().set('companyName', companyName);
    return this.http.get<number>(`${this.baseUrl}/offerWithoutSalary`, { params });
  }

  getAverageMonthlySalaryByCompany(companyName: string): Observable<CompanyMonthlySalaryDto[]> {
  const params = new HttpParams().set('companyName', companyName);
  return this.http.get<any[][]>(`${this.baseUrl}/averageMonthlySalaryByCompany`, { params }).pipe(
    map(rows => (rows || []).map(r => ({
      month: String(r[0]),
      avgSalaryMin: r[1] !== null ? Number(r[1]) : null,
      avgSalaryMax: r[2] !== null ? Number(r[2]) : null,
      offersWithSalaryCount: Number(r[3]) || 0
    })))
  );
}

  compareCompanySalaryWithMarket(companyName: string): Observable<CompanyVsMarketSalaryDto[]> {
    const params = new HttpParams().set('companyName', companyName);
    return this.http.get<any[][]>(`${this.baseUrl}/averageCompanySalaryOnAverageSalary`, { params }).pipe(
      map(rows => (rows || []).map(r => ({
        month: String(r[0]),
        companyAvgMin: r[1] !== null ? Number(r[1]) : null,
        globalAvgMin: r[2] !== null ? Number(r[2]) : null,
        companyAvgMax: r[3] !== null ? Number(r[3]) : null,
        globalAvgMax: r[4] !== null ? Number(r[4]) : null
      })))
    );
  }

  getMostPopularTechnologiesByCompany(companyName: string): Observable<{ tech: string; frequency: number }[]> {
    const params = new HttpParams().set('companyName', companyName);
    return this.http.get<any[][]>(`${this.baseUrl}/mostPopularTechnologiesByCompany`, { params }).pipe(
      map(rows => (rows || []).map(r => ({
        tech: String(r[0]),
        frequency: Number(r[1]) || 0
      })))
    );
  }

  getLocationDistributionByCompany(companyName: string): Observable<CompanyLocationDto[]> {
  const params = new HttpParams().set('companyName', companyName);
  return this.http.get<any[][]>(`${this.baseUrl}/locationDistributionByCompany`, { params }).pipe(
    map(rows => this.normalizeAndAggregateLocations(rows || []))
  );
}

private normalizeAndAggregateLocations(rows: any[][]): CompanyLocationDto[] {
  const cityMap = new Map<string, { count: number; variants: Set<string> }>();
  let total = 0;

  rows.forEach(([rawLoc, rawCount]) => {
    const label = String(rawLoc || 'Nieokreślona').trim();
    const count = Number(rawCount) || 0;
    total += count;

    const normalizedCity = this.extractMainCity(label);
    const existing = cityMap.get(normalizedCity);

    if (existing) {
      existing.count += count;
      existing.variants.add(label);
    } else {
      cityMap.set(normalizedCity, {
        count,
        variants: new Set([label])
      });
    }
  });

  return Array.from(cityMap.entries())
    .map(([city, data]) => ({
      city,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      rawVariants: Array.from(data.variants)
    }))
    .sort((a, b) => b.count - a.count);
}

private extractMainCity(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes('remote') || lower.includes('zdaln')) return 'Remote (Zdalnie)';
  if (lower.includes('warszaw') || lower.includes('warsaw')) return 'Warszawa';
  if (lower.includes('poznań') || lower.includes('poznan')) return 'Poznań';
  if (lower.includes('kraków') || lower.includes('krakow')) return 'Kraków';
  if (lower.includes('wrocław') || lower.includes('wroclaw')) return 'Wrocław';
  if (lower.includes('gdańsk') || lower.includes('gdansk') || lower.includes('trójmiasto')) return 'Gdańsk';
  if (lower.includes('katowic')) return 'Katowice';
  if (lower.includes('łódź') || lower.includes('lodz')) return 'Łódź';
  if (lower.includes('toruń') || lower.includes('torun')) return 'Toruń';
  if (lower.includes('szczecin')) return 'Szczecin';
  if (lower.includes('lublin')) return 'Lublin';
  if (lower.includes('białystok') || lower.includes('bialystok')) return 'Białystok';
  if (lower.includes('bydgoszcz')) return 'Bydgoszcz';
  if (lower.includes('rzeszów') || lower.includes('rzeszow')) return 'Rzeszów';

  // Fallback: bierze pierwszy człon przed przecinkiem
  return raw.split(',')[0].trim();
}

}