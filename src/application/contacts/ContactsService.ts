import type { Contact } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';

export class ContactsService {
  constructor(private contactsRepository: ContactsRepository) {}
  fetchContacts(page: number, pageSize: number): Promise<EntityListResponse<Contact>> {
    return this.contactsRepository.fetchContacts(page, pageSize);
  }
}
