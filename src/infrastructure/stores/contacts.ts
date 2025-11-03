import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { ContactsRepositoryImpl } from '@/infrastructure/repositories/ContactsRepositoryImpl';
import { ContactsService } from '@/application/contacts/ContactsService';
import type { Pagination } from '@/domain/repositories/Pagination';
import type {
  AgencyFilters,
  ContactFilters,
  CustomerFilters,
  GuestFilters,
  SupplierFilters,
} from '@/domain/contact/ContactFilters';
import type {
  Contact,
  Customer,
  Guest,
  Agency,
  Supplier,
  ContactSchema,
  ContactDetail,
} from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';

const contactsRepository = new ContactsRepositoryImpl();

export const useContactsStore = defineStore('contacts', () => {
  const contactsService = new ContactsService(contactsRepository);
  const contacts: Ref<Contact[]> = ref([]);
  const customers: Ref<Customer[]> = ref([]);
  const guests: Ref<Guest[]> = ref([]);
  const agencies: Ref<Agency[]> = ref([]);
  const suppliers: Ref<Supplier[]> = ref([]);
  const contactsCount = ref(0);
  const agenciesCount = ref(0);
  const suppliersCount = ref(0);
  const guestsCount = ref(0);
  const customersCount = ref(0);
  const contactSchema = ref(null as ContactSchema | null);

  const fetchContacts = async (
    pagination: Pagination,
    filters?: ContactFilters,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchContacts(pagination, filters, orderBy);
    contacts.value = result.items;
    contactsCount.value = result.count;
  };

  const fetchCustomers = async (
    pagination: Pagination,
    filters?: CustomerFilters,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchCustomers(pagination, filters, orderBy);
    customers.value = result.items;
    customersCount.value = result.count;
  };

  const fetchGuests = async (
    pagination: Pagination,
    filters?: GuestFilters,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchGuests(pagination, filters, orderBy);
    guests.value = result.items;
    guestsCount.value = result.count;
  };

  const fetchAgencies = async (
    pagination: Pagination,
    filters?: AgencyFilters,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchAgencies(pagination, filters, orderBy);
    agencies.value = result.items;
    agenciesCount.value = result.count;
  };

  const fetchSuppliers = async (
    pagination: Pagination,
    filters?: SupplierFilters,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchSuppliers(pagination, filters, orderBy);
    suppliers.value = result.items;
    suppliersCount.value = result.count;
  };

  const fetchContactById = async (id: number): Promise<ContactDetail | null> => {
    const result = await contactsService.fetchContactById(id);
    return result;
  };

  const fetchContactSchema = async (): Promise<void> => {
    const result = await contactsService.fetchContactSchema();
    contactSchema.value = result;
  };

  const persistContactDocument = async (
    contactId: number,
    document: PersonalDocument,
  ): Promise<void> => {
    await contactsService.persistContactDocument(contactId, document);
  };

  const createContact = async (contact: Partial<ContactDetail>): Promise<void> => {
    await contactsService.createContact(contact);
  };

  const updateContactFields = async (
    contactId: number,
    original: Partial<ContactDetail>,
    updated: Partial<ContactDetail>,
  ): Promise<void> => {
    await contactsService.updateContactFields(contactId, original, updated);
  };

  return {
    contacts: readonly(contacts),
    customers: readonly(customers),
    guests: readonly(guests),
    agencies: readonly(agencies),
    suppliers: readonly(suppliers),
    contactsCount: readonly(contactsCount),
    agenciesCount: readonly(agenciesCount),
    suppliersCount: readonly(suppliersCount),
    guestsCount: readonly(guestsCount),
    customersCount: readonly(customersCount),
    contactSchema: readonly(contactSchema),
    fetchContacts,
    fetchCustomers,
    fetchGuests,
    fetchAgencies,
    fetchSuppliers,
    fetchContactById,
    fetchContactSchema,
    createContact,
    updateContactFields,
  };
});
