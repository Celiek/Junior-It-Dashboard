import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { DemoChartComponent } from './demo-chart.component';

describe('DemoChartComponent', () => {
  let component: DemoChartComponent;
  let fixture: ComponentFixture<DemoChartComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DemoChartComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoChartComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();

    const request = httpMock.expectOne(
      'https://charts-backend-liawejxy3q-ew.a.run.app/api/offers/countOffersByLocation'
    );

    request.flush({
      chartTitle: 'Oferty junior IT według technologii',
      xAxisLabel: 'Technologia',
      yAxisLabel: 'Liczba ofert',
      data: [
        { label: 'Java', value: 42 },
        { label: 'JavaScript', value: 38 },
        { label: 'Python', value: 25 }
      ]
    });

    expect(component).toBeTruthy();
  });

  it('should load chart data from API', () => {
    fixture.detectChanges();

    const request = httpMock.expectOne(
      'http://localhost:8080/api/charts/offers-by-technology'
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      chartTitle: 'Oferty junior IT według technologii',
      xAxisLabel: 'Technologia',
      yAxisLabel: 'Liczba ofert',
      data: [
        { label: 'Java', value: 42 },
        { label: 'JavaScript', value: 38 },
        { label: 'Python', value: 25 },
        { label: 'SQL', value: 19 },
        { label: 'C#', value: 16 }
      ]
    });

    fixture.detectChanges();

    expect(component.chartTitle).toBe('Oferty junior IT według technologii');

    expect(component.chartData.labels).toEqual([
      'Java',
      'JavaScript',
      'Python',
      'SQL',
      'C#'
    ]);

    expect(component.chartData.datasets[0].label).toBe('Liczba ofert');

    expect(component.chartData.datasets[0].data).toEqual([
      42,
      38,
      25,
      19,
      16
    ]);
  });

  it('should show error title when API request fails', () => {
    fixture.detectChanges();

    const request = httpMock.expectOne(
      'http://localhost:8080/api/charts/offers-by-technology'
    );

    request.flush(
      { message: 'Backend error' },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    );

    fixture.detectChanges();

    expect(component.chartTitle).toBe('Nie udało się pobrać danych z API');
  });
});