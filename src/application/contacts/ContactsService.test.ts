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
    // arrange
    const response: EntityListResponse<Contact> = { count: 0, items: [] };
    contactsRepoMock.fetchContacts.mockResolvedValue(response);
    const pagination = { page: 1, pageSize: 20 };
    // act
    const result = await contactsService.fetchContacts(pagination);
    // assert
    expect(contactsRepoMock.fetchContacts).toHaveBeenCalledWith(pagination, undefined, undefined);
    expect(result).toBe(response);
  });

  it('passes all filters and returns response', async () => {
    // arrange
    const response: EntityListResponse<Contact> = {
      count: 2,
      items: [
        {
          id: 1,
          name: 'A',
          types: [],
          phones: [],
        },
        {
          id: 2,
          name: 'B',
          types: [],
          phones: [],
        },
      ],
    };
    contactsRepoMock.fetchContacts.mockResolvedValue(response);
    const pagination = { page: 1, pageSize: 20 };
    const filters = {
      globalSearch: 'john',
      nameContains: 'doe',
      emailContains: 'gmail.com',
      typeIn: ['GUEST'],
      countryIn: ['ES', 'PT'],
      phonesContains: undefined,
    };
    // act
    const result = await contactsService.fetchContacts(pagination, filters, 'name:asc');
    // assert
    expect(contactsRepoMock.fetchContacts).toHaveBeenCalledWith(pagination, filters, 'name:asc');
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const err = new Error('boom');
    contactsRepoMock.fetchContacts.mockRejectedValue(err);
    // act & assert
    await expect(contactsService.fetchContacts(pagination)).rejects.toThrow(err);
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
    // arrange
    const response: EntityListResponse<Customer> = { count: 0, items: [] };
    contactsRepoMock.fetchCustomers.mockResolvedValue(response);
    const pagination = { page: 1, pageSize: 20 };

    // act
    const result = await contactsService.fetchCustomers(pagination);
    // assert
    expect(contactsRepoMock.fetchCustomers).toHaveBeenCalledWith(pagination, undefined, undefined);
    expect(result).toBe(response);
  });

  it('passes all filters and returns response', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const filters = {
      globalSearch: 'abc',
      nameContains: 'name',
      vatContains: 'VAT123',
      emailContains: 'mail@acme.com',
    };
    const response: EntityListResponse<Customer> = {
      count: 1,
      items: [
        {
          id: 1,
          name: 'ACME',
          vat: 'VAT123',
          totalInvoiced: 0,
          phones: [],
        },
      ],
    };
    contactsRepoMock.fetchCustomers.mockResolvedValue(response);
    // act
    const result = await contactsService.fetchCustomers(pagination, filters, 'name:desc');
    // assert
    expect(contactsRepoMock.fetchCustomers).toHaveBeenCalledWith(pagination, filters, 'name:desc');
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const err = new Error('boom-customers');
    contactsRepoMock.fetchCustomers.mockRejectedValue(err);
    // act & assert
    await expect(contactsService.fetchCustomers(pagination, undefined, undefined)).rejects.toThrow(
      err,
    );
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
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const response: EntityListResponse<Guest> = { count: 0, items: [] };
    contactsRepoMock.fetchGuests.mockResolvedValue(response);
    // act
    const result = await contactsService.fetchGuests(pagination);
    // assert
    expect(contactsRepoMock.fetchGuests).toHaveBeenCalledWith(pagination, undefined, undefined);
    expect(result).toBe(response);
  });

  it('passes all filters (including boolean) and returns response', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const filters = {
      globalSearch: 'global',
      nameContains: 'doe',
      documentContains: 'DOC123',
      countryIn: ['ES', 'PT'],
      checkinDateFrom: new Date('2024-01-01'),
      checkinDateTo: new Date('2024-12-31'),
      inHouseOnly: true,
    };
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
    // act
    const result = await contactsService.fetchGuests(pagination, filters, 'name:asc');
    // assert
    expect(contactsRepoMock.fetchGuests).toHaveBeenCalledWith(pagination, filters, 'name:asc');
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 10 };
    const err = new Error('boom-guests');
    contactsRepoMock.fetchGuests.mockRejectedValue(err);
    // act & assert
    await expect(contactsService.fetchGuests(pagination)).rejects.toThrow(err);
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
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const response: EntityListResponse<Agency> = { count: 0, items: [] };
    contactsRepoMock.fetchAgencies.mockResolvedValue(response);
    // act
    const result = await contactsService.fetchAgencies(pagination);
    // assert
    expect(contactsRepoMock.fetchAgencies).toHaveBeenCalledWith(pagination, undefined, undefined);
    expect(result).toBe(response);
  });

  it('passes all filters and returns response', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const filters = {
      globalSearch: 'glob',
      nameContains: 'rd',
      emailContains: 'ops@roomdoo.com',
      countryIn: ['ES'],
      phonesContains: '+34900111222',
    };
    const response: EntityListResponse<Agency> = {
      count: 1,
      items: [
        {
          id: 100,
          name: 'Roomdoo Travel',
          phones: [],
        },
      ],
    };
    contactsRepoMock.fetchAgencies.mockResolvedValue(response);
    // act
    const result = await contactsService.fetchAgencies(pagination, filters, 'name:desc');
    // assert
    expect(contactsRepoMock.fetchAgencies).toHaveBeenCalledWith(pagination, filters, 'name:desc');
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 10 };
    const err = new Error('boom-agencies');
    contactsRepoMock.fetchAgencies.mockRejectedValue(err);
    // act & assert
    await expect(contactsService.fetchAgencies(pagination)).rejects.toThrow(err);
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
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const response: EntityListResponse<Supplier> = { count: 0, items: [] };
    contactsRepoMock.fetchSuppliers.mockResolvedValue(response);
    // act
    const result = await contactsService.fetchSuppliers(pagination);
    expect(contactsRepoMock.fetchSuppliers).toHaveBeenCalledWith(pagination, undefined, undefined);
    // assert
    expect(result).toBe(response);
  });

  it('passes all filters and returns response', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 20 };
    const filters = {
      globalSearch: 'paper',
      nameContains: 'pap',
      vatContains: 'B123',
      emailContains: 'paper@inc.com',
      countryIn: ['ES', 'FR'],
      phonesContains: '+33',
    };
    const response: EntityListResponse<Supplier> = {
      count: 3,
      items: [
        {
          id: 200,
          name: 'Paper Inc',
          vat: 'VAT123',
          totalInvoiced: 0,
          phones: [],
        },
      ],
    };
    contactsRepoMock.fetchSuppliers.mockResolvedValue(response);
    // act
    const result = await contactsService.fetchSuppliers(pagination, filters, 'name:asc');
    // assert
    expect(contactsRepoMock.fetchSuppliers).toHaveBeenCalledWith(pagination, filters, 'name:asc');
    expect(result).toBe(response);
  });

  it('propagates repository errors', async () => {
    // arrange
    const pagination = { page: 1, pageSize: 10 };
    const err = new Error('boom-suppliers');
    contactsRepoMock.fetchSuppliers.mockRejectedValue(err);
    // act & assert
    await expect(contactsService.fetchSuppliers(pagination)).rejects.toThrow(err);
  });
});
