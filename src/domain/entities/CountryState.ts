import type { Country } from './Country';

import type { Id } from '@/domain/types/Id';

export interface CountryState {
  id: Id;
  name: string;
  country: Country;
}
