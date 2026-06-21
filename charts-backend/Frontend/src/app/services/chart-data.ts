import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChartDataResponse } from '../models/chart-data';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  private readonly apiUrl = 'https://charts-backend-446117273077.europe-west1.run.app:8080/api/charts';

  constructor(private http: HttpClient) {}

  getOffersByTechnology(): Observable<ChartDataResponse> {
    return this.http.get<ChartDataResponse>(
      `${this.apiUrl}/offers-by-technology`
    );
  }
}