import type { Contact } from '../entities/Contact';
import type { EntityListResponse } from './EntityListResponse';

export interface ContactsRepository {
  fetchContacts(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    typeIn?: string,
    countryIn?: string[],
    orderBy?: string
  ): Promise<EntityListResponse<Contact>>;
}
