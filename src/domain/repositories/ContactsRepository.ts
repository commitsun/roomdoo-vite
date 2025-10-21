import type { EntityListResponse } from './EntityListResponse';

import type {
  AgencyFilters,
  ContactFilters,
  CustomerFilters,
  GuestFilters,
  SupplierFilters,
} from '@/domain/contact/ContactFilters';
import type { Pagination } from '@/domain/repositories/Pagination';
import type { Agency, Contact, Customer, Guest, Supplier } from '@/domain/entities/Contact';

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
}
