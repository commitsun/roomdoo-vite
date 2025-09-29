import type { Id } from '../types/Id';
import type { ContactType } from '../types/ContactType';
import type { Country } from './Country';
import type { PersonalDocument } from './PersonalDocument';
import type { Phone } from './Phone';

export interface Contact {
  id: Id;
  name: string;
  types: ContactType[];
  email?: string;
  country?: Country;
  phones: Phone[];
}

export interface Agency extends Omit<Contact, 'types'> {}
export interface Supplier extends Omit<Contact, 'types'> {
  vat: string;
  totalInvoiced: number;
}
export interface Customer extends Omit<Contact, 'types'> {
  vat: string;
  totalInvoiced: number;
}

export interface Guest extends Omit<Contact, 'types' | 'phones'> {
  identificationDocuments: PersonalDocument[];
  lastReservation: {
    id: Id;
    name: string;
  };
  internalNotes?: string;
  inHouse?: boolean;
}
