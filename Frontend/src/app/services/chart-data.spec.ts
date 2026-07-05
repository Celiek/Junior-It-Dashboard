import { TestBed } from '@angular/core/testing';

import { ChartData } from './chart-data';

describe('ChartData', () => {
  let service: ChartData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
