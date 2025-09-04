import type { Contact } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import { api } from '../http/axios';

function readPrimeFilterValue(meta: any) {
  if (!meta) return null;
  if (Array.isArray(meta?.constraints) && meta.constraints.length) {
    return meta.constraints[0]?.value ?? null;
  }
  return meta?.value ?? null;
}

function buildQueryParamsFromPrimeFilters(filters: any) {
  const params = new URLSearchParams();

  const name = readPrimeFilterValue(filters?.name);
  if (name) params.set('name', String(name).trim());

  const email = readPrimeFilterValue(filters?.email);
  if (email) params.set('email', String(email).trim());

  const type = readPrimeFilterValue(filters?.type);
  if (type != null && type !== '') {
    if (Array.isArray(type)) {
      params.set('type', type.join(','));
    } else {
      params.set('type', String(type));
    }
  }

  const country = readPrimeFilterValue(filters?.country);
  if (country != null && country !== '') {
    params.set('country', String(country));
  }

  return params;
}

export class ContactsRepositoryImpl implements ContactsRepository {
  async fetchContacts(
    page: number,
    pageSize: number,
    primeFilters?: any, // ahora espera el objeto de filtros de PrimeVue
    orderBy?: string // p. ej. 'name' o '-country'
  ): Promise<EntityListResponse<Contact>> {
    const params = buildQueryParamsFromPrimeFilters(primeFilters ?? {});
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    if (orderBy) {
      params.set('orderBy', orderBy);
    }

    const url = `/contacts?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Contact>>(url);
    return data;
  }
}
