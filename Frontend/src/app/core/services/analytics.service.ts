import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import {
  LocationOfferDto,
  SalaryOfferDto,
  TechnologyDto,
  CategoryDto
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
}