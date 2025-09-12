import type { Agency, Contact, Customer, Guest, Supplier } from '../entities/Contact';
import type { EntityListResponse } from './EntityListResponse';

export interface ContactsRepository {
  fetchContacts(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    typeIn?: string[],
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string
  ): Promise<EntityListResponse<Contact>>;
  fetchCustomers(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    vatContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string
  ): Promise<EntityListResponse<Customer>>;
  fetchGuests(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    documentContains?: string,
    countryIn?: string[],
    inhouseOnly?: boolean,
    orderBy?: string
  ): Promise<EntityListResponse<Guest>>;
  fetchAgencies(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string
  ): Promise<EntityListResponse<Agency>>;
  fetchSuppliers(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    vatContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string
  ): Promise<EntityListResponse<Supplier>>;
}
