import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobLocationStats } from '../models/job-location-stats';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  private readonly apiUrl = 'https://charts-backend-446117273077.europe-west1.run.app/api/offers';

  constructor(private http: HttpClient) {}

  getOffersByLocation(): Observable<JobLocationStats[]> {
    return this.http.get<JobLocationStats[]>(
      `${this.apiUrl}/countOffersByLocation`
    );
  }
}