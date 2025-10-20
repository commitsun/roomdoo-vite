import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { ContactsRepositoryImpl } from '@/infrastructure/repositories/ContactsRepositoryImpl';
import { ContactsService } from '@/application/contacts/ContactsService';
import type { Contact, Customer, Guest, Agency, Supplier } from '@/domain/entities/Contact';

const contactsRepository = new ContactsRepositoryImpl();

export const useContactsStore = defineStore('contacts', () => {
  const contactsService = new ContactsService(contactsRepository);
  const contacts: Ref<Contact[]> = ref([]);
  const customers: Ref<Customer[]> = ref([]);
  const guests: Ref<Guest[]> = ref([]);
  const agencies: Ref<Agency[]> = ref([]);
  const suppliers: Ref<Supplier[]> = ref([]);
  const contactsCount = ref(0);

  const fetchContacts = async (
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    typeIn?: string[],
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchContacts(
      page,
      pageSize,
      globalSearch,
      nameContains,
      emailContains,
      typeIn,
      countryIn,
      phonesContains,
      orderBy,
    );
    contacts.value = result.items;
    contactsCount.value = result.count;
  };

  const fetchCustomers = async (
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    vatContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchCustomers(
      page,
      pageSize,
      globalSearch,
      nameContains,
      vatContains,
      emailContains,
      countryIn,
      phonesContains,
      orderBy,
    );
    customers.value = result.items;
    contactsCount.value = result.count;
  };

  const fetchGuests = async (
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    documentContains?: string,
    countryIn?: string[],
    inhouseOnly?: boolean,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchGuests(
      page,
      pageSize,
      globalSearch,
      nameContains,
      documentContains,
      countryIn,
      inhouseOnly,
      orderBy,
    );
    guests.value = result.items;
    contactsCount.value = result.count;
  };

  const fetchAgencies = async (
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchAgencies(
      page,
      pageSize,
      globalSearch,
      nameContains,
      emailContains,
      countryIn,
      phonesContains,
      orderBy,
    );
    agencies.value = result.items;
    contactsCount.value = result.count;
  };

  const fetchSuppliers = async (
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    vatContains?: string,
    emailContains?: string,
    countryIn?: string[],
    phonesContains?: string,
    orderBy?: string,
  ): Promise<void> => {
    const result = await contactsService.fetchSuppliers(
      page,
      pageSize,
      globalSearch,
      nameContains,
      vatContains,
      emailContains,
      countryIn,
      phonesContains,
      orderBy,
    );
    suppliers.value = result.items;
    contactsCount.value = result.count;
  };

  return {
    contacts: readonly(contacts),
    customers: readonly(customers),
    guests: readonly(guests),
    agencies: readonly(agencies),
    suppliers: readonly(suppliers),
    contactsCount: readonly(contactsCount),
    fetchContacts,
    fetchCustomers,
    fetchGuests,
    fetchAgencies,
    fetchSuppliers,
  };
});
