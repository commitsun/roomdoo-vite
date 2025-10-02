import type {
  AgencyFilters,
  ContactFilters,
  CustomerFilters,
  GuestFilters,
  SupplierFilters,
} from '@/domain/contact/ContactFilters';
import type {
  Agency,
  Contact,
  ContactDetail,
  ContactSchema,
  Customer,
  Guest,
  Supplier,
} from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Pagination } from '@/domain/repositories/Pagination';

export class ContactsService {
  constructor(private contactsRepository: ContactsRepository) {}
  async fetchContacts(
    paginattion: Pagination,
    filters?: ContactFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Contact>> {
    const response = await this.contactsRepository.fetchContacts(paginattion, filters, orderBy);
    return response;
  }
  async fetchCustomers(
    pagination: Pagination,
    filters?: CustomerFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Customer>> {
    const response = await this.contactsRepository.fetchCustomers(pagination, filters, orderBy);
    return response;
  }
  async fetchGuests(
    pagination: Pagination,
    filters?: GuestFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Guest>> {
    const response = await this.contactsRepository.fetchGuests(pagination, filters, orderBy);
    return response;
  }
  async fetchAgencies(
    pagination: Pagination,
    filters?: AgencyFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Agency>> {
    const response = await this.contactsRepository.fetchAgencies(pagination, filters, orderBy);
    return response;
  }
  async fetchSuppliers(
    pagination: Pagination,
    filters?: SupplierFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Supplier>> {
    const response = await this.contactsRepository.fetchSuppliers(pagination, filters, orderBy);
    return response;
  }
  async fetchContactById(id: number): Promise<ContactDetail> {
    const contact = await this.contactsRepository.fetchContactById(id);
    const documents = await this.contactsRepository.fetchContactPersonalDocuments(id);
    contact.documents = documents;
    return contact;
  }
  async fetchContactSchema(): Promise<ContactSchema> {
    const schema = await this.contactsRepository.fetchContactSchema();
    return schema;
  }
  async persistContactDocument(contactId: number, document: PersonalDocument): Promise<void> {
    await this.contactsRepository.persistContactDocument(contactId, document);
  }
  async createContact(contact: Partial<ContactDetail>): Promise<void> {
    await this.contactsRepository.createContact(contact);
  }
  async updateContactFields(
    contactId: number,
    original: Partial<ContactDetail>,
    updated: Partial<ContactDetail>
  ): Promise<void> {
    await this.contactsRepository.updateContactFields(contactId, original, updated);
  }
}
