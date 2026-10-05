export interface TechFrequency {
  name: string;
  count: number;
}

export interface LocationStat {
  location: string;
  count: number;
}

export interface SalaryByContract {
  contractType: string; // np. 'b2b', 'uop', 'uz'
  salaryMin: number;
  salaryMax: number;
  currency: string;
}

export interface CategoryStat {
  category: string; // np. 'Backend', 'Frontend', 'Fullstack'
  count: number;
}

export interface DashboardData {
  totalOffers: number;
  offersWithSalaryCount: number;
  remoteOffersCount: number;
  technologies: TechFrequency[];
  locations: LocationStat[];
  salaries: SalaryByContract[];
  categories: CategoryStat[];
}