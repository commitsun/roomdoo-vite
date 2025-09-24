import type { Country } from './Country';
import type { CountryState } from './CountryState';
import type { PersonalDocument } from './PersonalDocument';
import type { PaymentTerm } from './PaymentTerm';
import type { Phone } from './Phone';
import type { Pricelist } from './Pricelist';
import type { Tag } from './Tag';

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
  lastReservation: {
    id: Id;
    name: string;
  };
  internalNotes?: string;
  inHouse?: boolean;
}

export interface ContactDetail extends Omit<Contact, 'types'> {
  contactType?: string;
  reference?: string;
  firstname?: string;
  lastname?: string;
  lang?: string;
  nationality?: Country;
  gender?: string;
  birthdate?: Date;
  street?: string;
  street2?: string;
  zipCode?: string;
  city?: string;
  state?: CountryState;
  paymentTerm?: PaymentTerm;
  invoicingPolicy?: string;
  pricelist?: Pricelist;
  internalNotes?: string;
  documents?: PersonalDocument[];
  fiscalIdNumber?: string;
  fiscalIdNumberType?: DocumentType;
  lastname2?: string;
  tags?: Tag[];
}

export interface ContactSchema {
  fields: string[];
}
