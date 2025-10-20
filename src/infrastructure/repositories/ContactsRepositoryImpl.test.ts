import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';
import { ContactsRepositoryImpl } from '@/infrastructure/repositories/ContactsRepositoryImpl';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Contact } from '@/domain/entities/Contact';

describe('ContactRepositoryImpl.fetchContacts', () => {
  let repo: ContactsRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ContactsRepositoryImpl();
  });

  it('builds URL with minimal params (page & page_size) and returns data', async () => {
    const data: EntityListResponse<Contact> = { count: 0, items: [] };
    vi.mocked(api.get).mockResolvedValue({ data });

    const result = await repo.fetchContacts(1, 25);

    // Inspect called URL
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    const calledUrl: string = vi.mocked(api.get).mock.calls[0][0];

    const url = new URL(calledUrl, 'http://url.com');
    expect(url.pathname).toBe('/contacts');
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.get('page_size')).toBe('25');

    // No optional filters should appear
    expect(url.searchParams.has('globalSearch')).toBe(false);
    expect(url.searchParams.has('nameContains')).toBe(false);
    expect(url.searchParams.has('emailContains')).toBe(false);
    expect(url.searchParams.has('typeIn')).toBe(false);
    expect(url.searchParams.has('countryIn')).toBe(false);
    expect(url.searchParams.has('orderBy')).toBe(false);

    expect(result).toBe(data);
  });

  it('builds URL with all params for CONTACTS', async () => {
    const data: EntityListResponse<Contact> = {
      count: 1,
      items: [{ id: 1, name: 'John', types: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchContacts(
      3, // page
      50, // pageSize
      'john', // globalSearch
      'doe', // nameContains
      'email@gmail.com', // emailContains
      ['guest'], // typeIn
      ['Argentina', 'Spain'], // countryIn
      '555444333', // phonesContains
      'name', // orderBy
    );
    const calledUrl: string = vi.mocked(api.get).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page_size')).toBe('50');
    expect(url.searchParams.get('globalSearch')).toBe('john');
    expect(url.searchParams.get('name')).toBe('doe');
    expect(url.searchParams.get('email')).toBe('email@gmail.com');
    expect(url.searchParams.get('types')).toBe('guest');
    const countryParams = url.searchParams.getAll('countries');
    expect(new Set(countryParams)).toEqual(new Set(['Argentina', 'Spain']));
    expect(url.searchParams.get('phone')).toBe('555444333');
    expect(url.searchParams.get('orderBy')).toBe('name');
  });

  it('builds URL with all params for CUSTOMERS', async () => {
    const data: EntityListResponse<Contact> = {
      count: 1,
      items: [{ id: 1, name: 'John', types: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchCustomers(
      3, // page
      50, // pageSize
      'john', // globalSearch
      'doe', // nameContains
      'email@gmail.com', // emailContains
      '222222', // vatContains
      ['Argentina', 'Spain'], // countryIn
      '555444333', // phonesContains
      'name', // orderBy
    );
    const calledUrl: string = vi.mocked(api.get).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page_size')).toBe('50');
    expect(url.searchParams.get('globalSearch')).toBe('john');
    expect(url.searchParams.get('name')).toBe('doe');
    expect(url.searchParams.get('email')).toBe('email@gmail.com');
    expect(url.searchParams.get('vat')).toBe('222222');
    const countryParams = url.searchParams.getAll('countries');
    expect(new Set(countryParams)).toEqual(new Set(['Argentina', 'Spain']));
    expect(url.searchParams.get('phone')).toBe('555444333');
    expect(url.searchParams.get('orderBy')).toBe('name');
  });

  it('builds URL with all params for GUESTS', async () => {
    const data: EntityListResponse<Contact> = {
      count: 1,
      items: [{ id: 1, name: 'John', types: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchGuests(
      3, // page
      50, // pageSize
      'john', // globalSearch
      'doe', // nameContains
      '222222', // documentContains
      ['Argentina', 'Spain'], // countryIn
      true, // inHouseOnly
      'name', // orderBy
    );
    const calledUrl: string = vi.mocked(api.get).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page_size')).toBe('50');
    expect(url.searchParams.get('globalSearch')).toBe('john');
    expect(url.searchParams.get('name')).toBe('doe');
    expect(url.searchParams.get('vat')).toBe('222222');
    const countryParams = url.searchParams.getAll('countries');
    expect(new Set(countryParams)).toEqual(new Set(['Argentina', 'Spain']));
    expect(url.searchParams.get('inHouse')).toBe('true');
    expect(url.searchParams.get('orderBy')).toBe('name');
  });

  it('builds URL with all params for AGENCIES', async () => {
    const data: EntityListResponse<Contact> = {
      count: 1,
      items: [{ id: 1, name: 'John', types: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchAgencies(
      3, // page
      50, // pageSize
      'john', // globalSearch
      'doe', // nameContains
      'johndoe@test.com', // emailContains
      ['Argentina', 'Spain'], // countryIn
      '222222', // phoneContains
      'name', // orderBy
    );
    const calledUrl: string = vi.mocked(api.get).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page_size')).toBe('50');
    expect(url.searchParams.get('globalSearch')).toBe('john');
    expect(url.searchParams.get('name')).toBe('doe');
    expect(url.searchParams.get('email')).toBe('johndoe@test.com');
    const countryParams = url.searchParams.getAll('countries');
    expect(new Set(countryParams)).toEqual(new Set(['Argentina', 'Spain']));
    expect(url.searchParams.get('phone')).toBe('222222');
    expect(url.searchParams.get('orderBy')).toBe('name');
  });

  it('builds URL with all params for SUPPLIERS', async () => {
    const data: EntityListResponse<Contact> = {
      count: 1,
      items: [{ id: 1, name: 'John', types: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchSuppliers(
      3, // page
      50, // pageSize
      'john', // globalSearch
      'doe', // nameContains
      '222222', // vatContains
      'johndoe@test.com', // emailContains
      ['Argentina', 'Spain'], // countryIn
      '222222', // phoneContains
      'name', // orderBy
    );
    const calledUrl: string = vi.mocked(api.get).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page_size')).toBe('50');
    expect(url.searchParams.get('globalSearch')).toBe('john');
    expect(url.searchParams.get('name')).toBe('doe');
    expect(url.searchParams.get('vat')).toBe('222222');
    expect(url.searchParams.get('email')).toBe('johndoe@test.com');
    const countryParams = url.searchParams.getAll('countries');
    expect(new Set(countryParams)).toEqual(new Set(['Argentina', 'Spain']));
    expect(url.searchParams.get('phone')).toBe('222222');
    expect(url.searchParams.get('orderBy')).toBe('name');
  });

  it('propagates axios errors when fetch CONTACTS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchContacts(1, 10)).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch AGENCIES', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchAgencies(1, 10)).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch CUSTOMERS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchCustomers(1, 10)).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch GUESTS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchGuests(1, 10)).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch SUPPLIERS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchSuppliers(1, 10)).rejects.toThrow(err);
  });
});
