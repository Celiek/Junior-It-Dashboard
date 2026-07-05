import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobTechnologyStats {
  technology: string;
  count: number;
}

export interface JobLocationStats {
  location: string;
  liczba_ofert: string;
}

export interface AverageSalaryByContractStats {
  averageSalary: number;
  contractType: string;
  month: string;
  offersCount: number;
}

export interface OffersByCategory {
  category: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  //private readonly apiUrl = 'https://charts-backend-446117273077.europe-west1.run.app/api/offers';
  private readonly apiUrl = 'http://localhost:8080/api/offers';

  constructor(private http: HttpClient) {}

  getOffersByLocation(): Observable<JobLocationStats[]> {
    return this.http.get<JobLocationStats[]>(
      `${this.apiUrl}/countOffersByLocation`
    );
  }

  getOffersByTechnology(): Observable<JobTechnologyStats[]> {
    return this.http.get<JobTechnologyStats[]>(
      `${this.apiUrl}/popularTechnologies`
    );
  }

getAverageSalaryByContractType(): Observable<AverageSalaryByContractStats[]> {
  return this.http.get<AverageSalaryByContractStats[]>(
    `${this.apiUrl}/averageSalaryByMonth`
    );
  }
getOffersByCategory(): Observable<OffersByCategory[]> {
  return this.http.get<OffersByCategory[]>(
    `${this.apiUrl}/countOffersByCategory`
    );
  }
}