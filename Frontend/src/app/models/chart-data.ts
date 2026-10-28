export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartDataResponse {
  chartTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: ChartPoint[];
}

export interface SourceStatDto{
  source : string;
  offersAmount: number;
}

export interface OffersOverviewDto{
  totalOffers: number;
  totalSources: number;
  sources : SourceStatDto[];
}