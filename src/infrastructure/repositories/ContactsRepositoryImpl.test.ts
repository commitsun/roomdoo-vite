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
    (api.get as any).mockResolvedValue({ data });

    const result = await repo.fetchContacts(1, 25);

    // Inspect called URL
    expect(api.get).toHaveBeenCalledTimes(1);
    const calledUrl: string = (api.get as any).mock.calls[0][0];

    const url = new URL(calledUrl, 'http://localhost');
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

  it('adds all filters including countryIn[] and orderBy', async () => {
    const data: EntityListResponse<Contact> = {
      count: 1,
      items: [{ id: 1, name: 'John', types: [] }],
    };
    (api.get as any).mockResolvedValue({ data });

    await repo.fetchContacts(
      3,
      50,
      'john', // globalSearch
      'doe', // nameContains
      'email@gmail.com', // emailContains
      'guest', // typeIn
      ['Argentina', 'Spain'], // countryIn
      '-name' // orderBy
    );

    const calledUrl: string = (api.get as any).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    // Required pagination
    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page_size')).toBe('50');

    // Filters
    expect(url.searchParams.get('globalSearch')).toBe('john');
    expect(url.searchParams.get('name')).toBe('doe');
    expect(url.searchParams.get('email')).toBe('email@gmail.com');
    expect(url.searchParams.get('type')).toBe('guest');

    const countryParams = url.searchParams.getAll('countries');
    expect(new Set(countryParams)).toEqual(new Set(['Argentina', 'Spain']));

    expect(url.searchParams.get('orderBy')).toBe('-name');
  });

  it('does not include empty/undefined filters; respects URL encoding', async () => {
    (api.get as any).mockResolvedValue({ data: { count: 0, items: [] } });

    await repo.fetchContacts(
      1,
      10,
      '', // empty -> should NOT be set
      undefined,
      undefined,
      'supplier',
      [], // empty array -> should NOT be set
      '-name'
    );

    const calledUrl: string = (api.get as any).mock.calls[0][0];
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.searchParams.has('globalSearch')).toBe(false);
    expect(url.searchParams.get('type')).toBe('supplier');
    expect(url.searchParams.has('countries')).toBe(false);
    expect(url.searchParams.get('orderBy')).toBe('-name');
  });

  it('propagates axios errors', async () => {
    const err = new Error('axios fail');
    (api.get as any).mockRejectedValue(err);

    await expect(repo.fetchContacts(1, 10)).rejects.toThrow(err);
  });
});
