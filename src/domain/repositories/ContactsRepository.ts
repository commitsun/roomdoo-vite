import type { Contact } from '../entities/Contact';
import type { EntityListResponse } from './EntityListResponse';

export interface ContactsRepository {
  fetchContacts(page: number, pageSize: number): Promise<EntityListResponse<Contact>>;
}
