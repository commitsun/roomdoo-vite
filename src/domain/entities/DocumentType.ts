import type { Id } from '@/domain/types/Id';
import type { Country } from './Country';

export interface DocumentType {
  id: Id;
  name: string;
  code: string;
  countries: Country[];
}
