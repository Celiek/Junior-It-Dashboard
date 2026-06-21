import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobLocationStats } from '../models/job-location-stats';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  private readonly apiUrl = 'https://charts-backend-liawejxy3q-ew.a.run.app/api/offers/countOffersByLocation';

  constructor(private http: HttpClient) {}

  getOffersByLocation(): Observable<JobLocationStats[]> {
    return this.http.get<JobLocationStats[]>(
      `${this.apiUrl}/offers-by-location`
    );
  }
}