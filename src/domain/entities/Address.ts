import type { Country } from './Country';
import type { CountryState } from './CountryState';

export interface Address {
  zip: string;
  city: string;
  state: CountryState;
  country: Country;
}
