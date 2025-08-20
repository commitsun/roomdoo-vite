import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { ContactsService } from '@/application/contacts/ContactsService';
import { ContactsRepositoryImpl } from '../repositories/ContactRepositoryImpl';
import type { Contact } from '@/domain/entities/Contact';

const contactRepository = new ContactsRepositoryImpl();

export const useContactsStore = defineStore('contacts', () => {
  const contactService = new ContactsService(contactRepository);
  const contacts: Ref<Contact[] | null> = ref(null);
  const contactsCount = ref(0);

  const fetchContacts = async (page: number, pageSize: number) => {
    const result = await contactService.fetchContacts(page, pageSize);
    contacts.value = result.items;
    contactsCount.value = result.count;
  };
  return { contacts, contactsCount, fetchContacts };
});
