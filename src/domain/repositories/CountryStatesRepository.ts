import type { CountryState } from '@/domain/entities/CountryState';

export interface CountryStatesRepository {
  fetchCountryStates(): Promise<CountryState[]>;
  fetchCountryStatesByCountryId(countryId: number): Promise<CountryState[]>;
}
