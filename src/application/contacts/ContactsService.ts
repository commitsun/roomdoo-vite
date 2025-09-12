import type { Agency, Contact, Customer, Guest, Supplier } from '@/domain/entities/Contact';
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
    typeIn?: string[],
    countryIn?: string[],
    phonesContains?: string,
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
      phonesContains,
      orderBy
    );
    return response;
  }
  async fetchCustomers(
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    vatContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string
  ): Promise<EntityListResponse<Customer>> {
    const response = await this.contactsRepository.fetchCustomers(
      page,
      pageSize,
      globalSearch,
      nameContains,
      vatContains,
      emailContains,
      countryIn,
      phonesContains,
      orderBy
    );
    return response;
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
    const response = await this.contactsRepository.fetchGuests(
      page,
      pageSize,
      globalSearch,
      nameContains,
      documentContains,
      countryIn,
      inhouseOnly,
      orderBy
    );
    return response;
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
    const response = await this.contactsRepository.fetchAgencies(
      page,
      pageSize,
      globalSearch,
      nameContains,
      emailContains,
      countryIn,
      phonesContains,
      orderBy
    );
    return response;
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
    const response = await this.contactsRepository.fetchSuppliers(
      page,
      pageSize,
      globalSearch,
      nameContains,
      vatContains,
      emailContains,
      countryIn,
      phonesContains,
      orderBy
    );
    return response;
  }
}
