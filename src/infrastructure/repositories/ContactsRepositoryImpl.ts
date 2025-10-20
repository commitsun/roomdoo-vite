import type { Agency, Contact, Customer, Guest, Supplier } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
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
  inhouseOnly?: boolean;
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
  if ('inhouseOnly' in opts) {
    params.set('inHouse', String(Boolean(opts.inhouseOnly)));
  }
  return params;
}

export class ContactsRepositoryImpl implements ContactsRepository {
  async fetchContacts(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    typeIn?: string[],
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<EntityListResponse<Contact>> {
    const params = buildQueryParamsFromFilters({
      globalSearch,
      nameContains,
      emailContains,
      countryIn,
      typeIn,
      phonesContains,
    });
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/contacts?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Contact>>(url);
    return data;
  }

  async fetchCustomers(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    vatContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<EntityListResponse<Customer>> {
    const params = buildQueryParamsFromFilters({
      globalSearch,
      nameContains,
      emailContains,
      countryIn,
      vatContains,
      phonesContains,
    });
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/customers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Customer>>(url);
    return data;
  }

  async fetchGuests(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    documentContains?: string,
    countryIn?: string[],
    inhouseOnly?: boolean,
    orderBy?: string,
  ): Promise<EntityListResponse<Guest>> {
    const params = buildQueryParamsFromFilters({
      globalSearch,
      nameContains,
      documentContains,
      countryIn,
      inhouseOnly,
    });
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

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
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<EntityListResponse<Agency>> {
    const params = buildQueryParamsFromFilters({
      globalSearch,
      nameContains,
      emailContains,
      countryIn,
      phonesContains,
    });
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/agencies?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Agency>>(url);
    return data;
  }

  async fetchSuppliers(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    vatContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<EntityListResponse<Supplier>> {
    const params = buildQueryParamsFromFilters({
      globalSearch,
      nameContains,
      emailContains,
      countryIn,
      phonesContains,
      vatContains,
    });
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/suppliers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Supplier>>(url);
    return data;
  }
}
