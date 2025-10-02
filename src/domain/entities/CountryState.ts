import type { Id } from '@/domain/types/Id';
import type { Country } from './Country';

export interface CountryState {
  id: Id;
  name: string;
  country: Country;
}
