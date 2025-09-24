import type { CountryState } from '@/domain/entities/CountryState';

export interface CountryStatesRepository {
  fetchCountryStates(): Promise<CountryState[]>;
}
