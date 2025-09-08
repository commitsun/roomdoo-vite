import type { Id } from '../types/Id';
import type { ContactType } from '../types/ContactType';
import type { Country } from './Country';
import type { PersonalDocument } from './PersonalDocument';

export interface Contact {
  id: Id;
  name: string;
  types: ContactType[];
  email?: string;
  country?: Country;
  phones?: string[];
}

export interface AgencyContact extends Contact {}
export interface Supplier extends Contact {
  vat: string;
  totalInvoiced: number;
}
export interface Customer extends Contact {
  vat: string;
  totalInvoiced: number;
}

export interface Guest extends Contact {
  documents: PersonalDocument[];
  lastReservationId?: Id;
  internalNotes?: string;
}
