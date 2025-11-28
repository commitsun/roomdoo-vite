import type { EntityListResponse } from './EntityListResponse';

import type {
  Agency,
  Contact,
  Customer,
  Guest,
  Supplier,
  ContactDetail,
  ContactSchema,
} from '@/domain/entities/Contact';
import type {
  AgencyFilters,
  ContactFilters,
  CustomerFilters,
  GuestFilters,
  SupplierFilters,
} from '@/domain/contact/ContactFilters';
import type { Pagination } from '@/domain/repositories/Pagination';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';

export interface ContactsRepository {
  fetchContacts(
    pagination: Pagination,
    filters?: ContactFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Contact>>;

  fetchCustomers(
    pagination: Pagination,
    filters?: CustomerFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Customer>>;

  fetchGuests(
    pagination: Pagination,
    filters?: GuestFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Guest>>;

  fetchAgencies(
    pagination: Pagination,
    filters?: AgencyFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Agency>>;

  fetchSuppliers(
    pagination: Pagination,
    filters?: SupplierFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Supplier>>;
  fetchContactById(id: number): Promise<ContactDetail>;
  fetchContactPersonalDocuments(contactId: number): Promise<PersonalDocument[]>;
  fetchContactSchema(): Promise<ContactSchema>;
  createContact(contact: Partial<ContactDetail>): Promise<ContactDetail>;
  updateContactFields(
    contactId: number,
    original: Partial<ContactDetail>,
    updated: Partial<ContactDetail>,
  ): Promise<void>;
  checkContactDuplicateByDocument(
    documentTypeId: number,
    documentNumber: string,
    countryId: number,
  ): Promise<{ id: number; name: string } | null>;
  checkContactDuplicateByFiscalDocument(
    fiscalDocumentType: string,
    fiscalDocumentNumber: string,
    countryId?: number,
  ): Promise<{ id: number; name: string } | null>;
}
