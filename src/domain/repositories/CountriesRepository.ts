import type { Country } from '@/domain/entities/Country';

export interface CountriesRepository {
  fetchCountries(): Promise<Country[]>;
}
