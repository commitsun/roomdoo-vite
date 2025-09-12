import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { ContactsService } from '@/application/contacts/ContactsService';
import { ContactsRepositoryImpl } from '@/infrastructure/repositories/ContactsRepositoryImpl';
import type { Contact } from '@/domain/entities/Contact';

const contactRepository = new ContactsRepositoryImpl();

export const useContactsStore = defineStore('contacts', () => {
  const contactService = new ContactsService(contactRepository);
  const contacts: Ref<Contact[]> = ref([]);
  const contactsCount = ref(0);

  const fetchContacts = async (
    page: number,
    pageSize: number,
    globalSearch?: string,
    nameContains?: string,
    emailContains?: string,
    typeIn?: string,
    countryIn?: string[],
    orderBy?: string
  ) => {
    const result = await contactService.fetchContacts(
      page,
      pageSize,
      globalSearch,
      nameContains,
      emailContains,
      typeIn,
      countryIn,
      orderBy
    );
    contacts.value = result.items;
    contactsCount.value = result.count;
  };
  return {
    contacts: readonly(contacts),
    contactsCount: readonly(contactsCount),
    fetchContacts,
  };
});
