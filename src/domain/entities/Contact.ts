import type { Country } from './Country';
import type { PersonalDocument } from './PersonalDocument';
import type { Phone } from './Phone';

import type { ContactType } from '@/domain/types/ContactType';
import type { Id } from '@/domain/types/Id';

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
  lastReservationDate: Date;
  internalNotes?: string;
  inHouse?: boolean;
}

export interface GuestDTO extends Omit<Guest, 'lastReservationDate'> {
  lastReservationDate: string;
}
