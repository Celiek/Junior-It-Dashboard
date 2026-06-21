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