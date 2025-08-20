import type { Id } from '../types/Id';
import type { ContactType } from '../types/ContactType';
import type { Country } from './Country';

export interface Contact {
  id: Id;
  types: ContactType[];
  name: string;
  email?: string;
  phones?: string[];
  country?: Country;
}
