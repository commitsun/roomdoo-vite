import type {
  AgencyFilters,
  ContactFilters,
  CustomerFilters,
  GuestFilters,
  SupplierFilters,
} from '@/domain/contact/ContactFilters';
import type { Agency, Contact, Customer, Guest, Supplier } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Pagination } from '@/domain/repositories/Pagination';
import { api } from '@/infrastructure/http/axios';

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

function buildQueryParamsFromFilters(opts: {
  globalSearch?: string;
  nameContains?: string;
  documentContains?: string;
  emailContains?: string;
  countryIn?: string[];
  typeIn?: string[];
  phonesContains?: string;
  vatContains?: string;
  inHouseOnly?: boolean;
}): URLSearchParams {
  const params = new URLSearchParams();

  // Scalars — only set when non-empty string
  if (isNonEmptyString(opts.globalSearch)) {
    params.set('globalSearch', opts.globalSearch.trim());
  }
  if (isNonEmptyString(opts.nameContains)) {
    params.set('name', opts.nameContains.trim());
  }
  if (isNonEmptyString(opts.emailContains)) {
    params.set('email', opts.emailContains.trim());
  }
  if (isNonEmptyString(opts.documentContains)) {
    params.set('vat', opts.documentContains.trim());
  }

  // Arrays — check length explicitly and filter empty items
  if (Array.isArray(opts.typeIn) && opts.typeIn.length > 0) {
    for (const t of opts.typeIn) {
      params.append('types', t);
    }
  }
  if (isNonEmptyString(opts.phonesContains)) {
    params.set('phone', opts.phonesContains.trim());
  }
  if (Array.isArray(opts.countryIn) && opts.countryIn.length > 0) {
    for (const c of opts.countryIn) {
      params.append('countries', c.trim());
    }
  }

  // Override VAT if specific vatContains provided
  if (isNonEmptyString(opts.vatContains)) {
    params.set('vat', opts.vatContains.trim());
  }

  // Boolean — include only if property is present (even if false)
  if ('inHouseOnly' in opts) {
    params.set('inHouse', String(Boolean(opts.inHouseOnly)));
  }
  return params;
}

export class ContactsRepositoryImpl implements ContactsRepository {
  async fetchContacts(
    pagination: Pagination,
    filters?: ContactFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Contact>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/contacts?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Contact>>(url);
    return data;
  }

  async fetchCustomers(
    pagination: Pagination,
    filters?: CustomerFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Customer>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/customers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Customer>>(url);
    return data;
  }

  async fetchGuests(
    pagination: Pagination,
    filters?: GuestFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Guest>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/guests?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Guest>>(url);

    const guests: Guest[] = data.items.map((raw) => ({
      id: raw.id,
      name: raw.name,
      country: raw.country,
      identificationDocuments: raw.identificationDocuments,
      inHouse: raw.inHouse,
      internalNotes: raw.internalNotes,
      lastReservation: raw.lastReservation,
    }));

    return { ...data, items: guests };
  }

  async fetchAgencies(
    pagination: Pagination,
    filters?: AgencyFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Agency>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/agencies?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Agency>>(url);
    return data;
  }

  async fetchSuppliers(
    pagination: Pagination,
    filters?: SupplierFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Supplier>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/suppliers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Supplier>>(url);
    return data;
  }
}
