export interface LocationOfferDto {
  location: string;
  liczba_ofert: number;
}

export interface SalaryOfferDto {
  averageSalary: number;
  contractType: string;
  month: string;
  offersCount: number;
}

export interface TechnologyDto {
  technology: string;
  count: number;
}

export interface CategoryDto {
  category: string;
  count: number;
}

export interface SourceStatDto {
  source: string;
  offersAmount: number;
}

export interface OffersOverviewDto {
  totalOffers: number;
  totalSources: number;
  sources: SourceStatDto[];
}

export interface CompanyOffersDTO{
  company: string;
  amount: number;
}

export type CompanyLocationOffersMap = Record<string, Record<string, number>>;

export interface JobSummaryDTO {
  title: string;
  company: string;
  location: string;
  requirements: string;
  offer_url: string;
  source: string;
  scraped_at: string;
  category: string;
}

export interface CompanyDetailsData {
  latestOffers: JobSummaryDTO[];
  totalOffersThisYear: number;
  sources: { source: string; count: number; percentage: number }[];
  categories: { category: string; count: number }[];
}