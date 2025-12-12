import type { Country } from './Country';
import type { CountryState } from './CountryState';
import type { PersonalDocument } from './PersonalDocument';
import type { Phone } from './Phone';
import type { Tag } from './Tag';
import type { SaleChannel } from './SaleChannel';

import type { ContactType } from '@/domain/types/ContactType';
import type { Id } from '@/domain/types/Id';

export interface Contact {
  id: Id;
  name: string;
  image: string;
  types: ContactType[];
  email?: string;
  country?: Country;
  phones?: Phone[];
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
  lastReservation: {
    id: Id;
    name: string;
  };
  internalNotes?: string;
  inHouse?: boolean;
}

export interface GuestDTO extends Omit<Guest, 'lastReservationDate'> {
  lastReservationDate: string;
}
export interface ContactDetail extends Omit<Contact, 'types' | 'image'> {
  contactType?: string;
  reference?: string;
  firstname?: string;
  lastname?: string;
  lastname2?: string;
  lang?: string;
  nationality?: Country;
  gender?: string;
  birthdate?: Date | null;
  street?: string;
  street2?: string;
  zipCode?: string;
  city?: string;
  state?: CountryState;
  invoicingPolicy?: string;
  internalNotes?: string;
  documents?: PersonalDocument[];
  residenceStreet?: string;
  residenceZip?: string;
  residenceCity?: string;
  residenceState?: CountryState;
  residenceCountry?: Country;
  fiscalIdNumber?: string;
  fiscalIdNumberType?: string;
  tags?: Tag[];
  saleChannel?: SaleChannel;
  defaultCommission?: number;
  comercial?: string;
}
