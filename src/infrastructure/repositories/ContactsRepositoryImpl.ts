import type { Agency, Contact, Customer, Guest, Supplier } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import { api } from '@/infrastructure/http/axios';

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
}) {
  const params = new URLSearchParams();
  if (opts.globalSearch) {
    params.set('globalSearch', opts.globalSearch);
  }
  if (opts.nameContains) {
    params.set('name', opts.nameContains);
  }
  if (opts.emailContains) {
    params.set('email', opts.emailContains);
  }
  if (opts.documentContains) {
    params.set('vat', opts.documentContains);
  }
  if (opts.typeIn?.length) {
    for (const c of opts.typeIn) {
      if (c) params.append('types', c);
    }
  }
  if (opts.phonesContains) {
    params.set('phone', opts.phonesContains);
  }
  if (opts.countryIn?.length) {
    for (const c of opts.countryIn) {
      if (c) params.append('countries', c);
    }
  }
  if (opts.vatContains) {
    params.set('vat', opts.vatContains);
  }
  if (opts.inhouseOnly !== undefined) {
    params.set('inHouse', String(opts.inhouseOnly));
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
    orderBy?: string
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

    if (orderBy) {
      params.set('orderBy', orderBy);
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
    orderBy?: string
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
    if (orderBy) params.set('orderBy', orderBy);

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
    orderBy?: string
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
    if (orderBy) params.set('orderBy', orderBy);

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
      phones: raw.phones,
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
    orderBy?: string
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
    if (orderBy) params.set('orderBy', orderBy);

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
    orderBy?: string
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
    if (orderBy) params.set('orderBy', orderBy);

    const url = `/suppliers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Supplier>>(url);
    return data;
  }
}
