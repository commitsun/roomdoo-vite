import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactsService } from './ContactsService';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Contact } from '@/domain/entities/Contact';

describe('ContactsService.fetchContacts', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchContacts: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('passes pagination without filters and returns response as-is', async () => {
    const response: EntityListResponse<Contact> = { count: 0, items: [] };
    contactsRepoMock.fetchContacts.mockResolvedValue(response);

    const result = await contactsService.fetchContacts(1, 20);

    expect(contactsRepoMock.fetchContacts).toHaveBeenCalledWith(
      1,
      20,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(result).toBe(response);
  });

  it('passes all filters and returns response', async () => {
    const response: EntityListResponse<Contact> = {
      count: 2,
      items: [
        { id: 1, name: 'A', types: [] },
        { id: 2, name: 'B', types: [] },
      ],
    };
    contactsRepoMock.fetchContacts.mockResolvedValue(response);

    const result = await contactsService.fetchContacts(
      2,
      50,
      'john',
      'doe',
      'gmail.com',
      'GUEST',
      ['ES', 'PT'],
      'name:asc'
    );

    expect(contactsRepoMock.fetchContacts).toHaveBeenCalledWith(
      2,
      50,
      'john',
      'doe',
      'gmail.com',
      'GUEST',
      ['ES', 'PT'],
      'name:asc'
    );
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom');
    contactsRepoMock.fetchContacts.mockRejectedValue(err);

    await expect(contactsService.fetchContacts(1, 10)).rejects.toThrow(err);
  });
});
