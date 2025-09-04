import type { Contact } from '../entities/Contact';
import type { EntityListResponse } from './EntityListResponse';

export interface ContactsRepository {
  fetchContacts(
    page: number,
    pageSize: number,
    filters?: any,
    sortField?: string
  ): Promise<EntityListResponse<Contact>>;
}
