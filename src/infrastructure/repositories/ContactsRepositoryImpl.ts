import type { Contact } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import { api } from '@/infrastructure/http/axios';

function buildQueryParamsFromFilters(
  globalSearch: string | undefined,
  nameContains: string | undefined,
  emailContains: string | undefined,
  typeIn: string | undefined,
  countryIn: string[] | undefined
) {
  const params = new URLSearchParams();

  if (globalSearch) {
    params.set('globalSearch', globalSearch);
  }
  if (nameContains) {
    params.set('name', nameContains);
  }
  if (emailContains) {
    params.set('email', emailContains);
  }
  if (typeIn) {
    params.set('type', typeIn);
  }
  if (countryIn && countryIn.length > 0) {
    countryIn.forEach((country) => {
      params.append('countries', country);
    });
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
    typeIn?: string,
    countryIn?: string[],
    orderBy?: string
  ): Promise<EntityListResponse<Contact>> {
    const params = buildQueryParamsFromFilters(
      globalSearch,
      nameContains,
      emailContains,
      typeIn,
      countryIn
    );
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
