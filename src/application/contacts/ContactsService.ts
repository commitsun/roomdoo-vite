import type { Contact } from '@/domain/entities/Contact';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';

export class ContactsService {
  constructor(private contactsRepository: ContactsRepository) {}
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
    const response = await this.contactsRepository.fetchContacts(
      page,
      pageSize,
      globalSearch,
      nameContains,
      emailContains,
      typeIn,
      countryIn,
      orderBy
    );
    return response;
  }
}
