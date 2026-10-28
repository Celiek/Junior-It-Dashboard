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