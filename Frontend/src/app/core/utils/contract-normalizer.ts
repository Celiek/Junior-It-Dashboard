import { SalaryOfferDto } from '../models/market-api.models';

export type NormalizedContract = 'B2B' | 'UoP' | 'Zlecenie' | 'Inne';

export function normalizeContractType(type: string): NormalizedContract {
  const lower = type.toLowerCase();
  if (lower.includes('b2b')) return 'B2B';
  if (lower.includes('prac') || lower.includes('employment') || lower.includes('uop') || lower.includes('coe')) return 'UoP';
  if (lower.includes('zlec') || lower.includes('mandate') || lower.includes('com')) return 'Zlecenie';
  return 'Inne';
}

export function isMonthlyRate(item: SalaryOfferDto): boolean {
  // Odrzucamy stawki godzinowe (np. 84 zł/h czy 44 zł/h)
  return item.averageSalary > 500 && !item.contractType.includes('godz.') && !item.contractType.includes('hr.');
}