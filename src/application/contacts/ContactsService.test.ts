import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactsService } from './ContactsService';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Contact, Customer, Guest, Agency, Supplier } from '@/domain/entities/Contact';

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
      ['GUEST'],
      ['ES', 'PT'],
      undefined,
      'name:asc'
    );

    expect(contactsRepoMock.fetchContacts).toHaveBeenCalledWith(
      2,
      50,
      'john',
      'doe',
      'gmail.com',
      ['GUEST'],
      ['ES', 'PT'],
      undefined,
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

describe('ContactsService.fetchCustomers', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchCustomers: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('passes pagination without filters and returns response as-is', async () => {
    const response: EntityListResponse<Customer> = { count: 0, items: [] };
    contactsRepoMock.fetchCustomers.mockResolvedValue(response);
    const result = await contactsService.fetchCustomers(1, 25);
    expect(contactsRepoMock.fetchCustomers).toHaveBeenCalledWith(
      1,
      25,
      undefined,
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
    const response: EntityListResponse<Customer> = {
      count: 1,
      items: [{ id: 1, name: 'ACME', vat: 'VAT123', totalInvoiced: 0 }],
    };
    contactsRepoMock.fetchCustomers.mockResolvedValue(response);

    const result = await contactsService.fetchCustomers(
      3,
      10,
      'abc',
      'name',
      'VAT123',
      'mail@acme.com',
      ['ES'],
      '+34',
      'name:desc'
    );

    expect(contactsRepoMock.fetchCustomers).toHaveBeenCalledWith(
      3,
      10,
      'abc',
      'name',
      'VAT123',
      'mail@acme.com',
      ['ES'],
      '+34',
      'name:desc'
    );
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-customers');
    contactsRepoMock.fetchCustomers.mockRejectedValue(err);
    await expect(contactsService.fetchCustomers(1, 10)).rejects.toThrow(err);
  });
});

describe('ContactsService.fetchGuests', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchGuests: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('passes pagination without filters and returns response as-is', async () => {
    const response: EntityListResponse<Guest> = { count: 0, items: [] };
    contactsRepoMock.fetchGuests.mockResolvedValue(response);

    const result = await contactsService.fetchGuests(1, 15);

    expect(contactsRepoMock.fetchGuests).toHaveBeenCalledWith(
      1,
      15,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(result).toBe(response);
  });

  it('passes all filters (including boolean) and returns response', async () => {
    const response: EntityListResponse<Guest> = {
      count: 2,
      items: [
        {
          id: 10,
          name: 'John',
          identificationDocuments: [],
          lastReservation: { id: 1, name: 'Res 1' },
        },
        {
          id: 11,
          name: 'Jane',
          identificationDocuments: [],
          lastReservation: { id: 2, name: 'Res 2' },
        },
      ],
    };
    contactsRepoMock.fetchGuests.mockResolvedValue(response);

    const result = await contactsService.fetchGuests(
      4,
      25,
      'global',
      'doe',
      'DOC123',
      ['ES', 'PT'],
      true,
      'name:asc'
    );

    expect(contactsRepoMock.fetchGuests).toHaveBeenCalledWith(
      4,
      25,
      'global',
      'doe',
      'DOC123',
      ['ES', 'PT'],
      true,
      'name:asc'
    );
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-guests');
    contactsRepoMock.fetchGuests.mockRejectedValue(err);
    await expect(contactsService.fetchGuests(1, 10)).rejects.toThrow(err);
  });
});

describe('ContactsService.fetchAgencies', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchAgencies: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('passes pagination without filters and returns response as-is', async () => {
    const response: EntityListResponse<Agency> = { count: 0, items: [] };
    contactsRepoMock.fetchAgencies.mockResolvedValue(response);

    const result = await contactsService.fetchAgencies(2, 30);

    expect(contactsRepoMock.fetchAgencies).toHaveBeenCalledWith(
      2,
      30,
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
    const response: EntityListResponse<Agency> = {
      count: 1,
      items: [{ id: 100, name: 'Roomdoo Travel' }],
    };
    contactsRepoMock.fetchAgencies.mockResolvedValue(response);

    const result = await contactsService.fetchAgencies(
      5,
      50,
      'glob',
      'rd',
      'ops@roomdoo.com',
      ['ES'],
      '+34900111222',
      'name:desc'
    );

    expect(contactsRepoMock.fetchAgencies).toHaveBeenCalledWith(
      5,
      50,
      'glob',
      'rd',
      'ops@roomdoo.com',
      ['ES'],
      '+34900111222',
      'name:desc'
    );
    expect(result).toBe(response);
  });
});

describe('ContactsService.fetchSuppliers', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchSuppliers: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('passes pagination without filters and returns response as-is', async () => {
    const response: EntityListResponse<Supplier> = { count: 0, items: [] };
    contactsRepoMock.fetchSuppliers.mockResolvedValue(response);

    const result = await contactsService.fetchSuppliers(1, 40);

    expect(contactsRepoMock.fetchSuppliers).toHaveBeenCalledWith(
      1,
      40,
      undefined,
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
    const response: EntityListResponse<Supplier> = {
      count: 3,
      items: [{ id: 200, name: 'Paper Inc', vat: 'VAT123', totalInvoiced: 0 }],
    };
    contactsRepoMock.fetchSuppliers.mockResolvedValue(response);

    const result = await contactsService.fetchSuppliers(
      6,
      10,
      'paper',
      'pap',
      'B123',
      'paper@inc.com',
      ['ES', 'FR'],
      '+33',
      'name:asc'
    );

    expect(contactsRepoMock.fetchSuppliers).toHaveBeenCalledWith(
      6,
      10,
      'paper',
      'pap',
      'B123',
      'paper@inc.com',
      ['ES', 'FR'],
      '+33',
      'name:asc'
    );
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-suppliers');
    contactsRepoMock.fetchSuppliers.mockRejectedValue(err);
    await expect(contactsService.fetchSuppliers(1, 10)).rejects.toThrow(err);
  });
});
