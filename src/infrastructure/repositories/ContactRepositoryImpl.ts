import type { Contact } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import { api } from '../http/axios';

export class ContactsRepositoryImpl implements ContactsRepository {
  async fetchContacts(page: number, pageSize: number): Promise<EntityListResponse<Contact>> {
    const response = await api.get<EntityListResponse<Contact>>(
      `/contacts?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  }
}
