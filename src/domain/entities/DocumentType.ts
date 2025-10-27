import type { Country } from './Country';

import type { Id } from '@/domain/types/Id';

export interface DocumentType {
  id: Id;
  name: string;
  code: string;
  countries: Country[];
}
