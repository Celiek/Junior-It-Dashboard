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

export interface OfferSummaryDTO {
  id?: number | string;
  title: string;
  company: string;
  location: string;
  category: string;
  source: string;
  offer_url: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  description: string;
  publishedAt?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface RelistedOfferMonthlyDto {
  month: string;
  brandNewOffers: number;
  relistedOffers: number;
  totalRecords: number;
  relistRatioPercentage: number;
}

export interface CompanyMonthlySalaryDto {
  month: string;
  avgSalaryMin: number | null;
  avgSalaryMax: number | null;
  offersWithSalaryCount: number;
}

export interface CompanyVsMarketSalaryDto {
  month: string;
  companyAvgMin: number | null;
  globalAvgMin: number | null;
  companyAvgMax: number | null;
  globalAvgMax: number | null;
}

export interface CompanyTechDto {
  tech: string;
  frequency: number;
  percentage: number; // wyliczane na froncie na podstawie totalOffers
}

export interface CompanyLocationDto {
  city: string;
  count: number;
  percentage: number;
  rawVariants: string[]; // przechowuje oryginalne nazwy (np. dzielnice/ulice) do podglądu
}