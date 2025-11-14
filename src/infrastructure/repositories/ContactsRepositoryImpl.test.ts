import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
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

    const result = await repo.fetchContacts({ page: 1, pageSize: 25 });

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
      items: [{ id: 1, name: 'John', types: [], phones: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });
    await repo.fetchContacts(
      { page: 3, pageSize: 50 }, // pagination
      {
        globalSearch: 'john',
        nameContains: 'doe',
        emailContains: 'email@gmail.com',
        typeIn: ['guest'],
        countryIn: ['Argentina', 'Spain'],
        phonesContains: '555444333',
      }, // filters
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
      items: [{ id: 1, name: 'John', types: [], phones: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchCustomers(
      { page: 3, pageSize: 50 }, // pagination
      {
        globalSearch: 'john',
        nameContains: 'doe',
        emailContains: 'email@gmail.com',
        vatContains: '222222',
        countryIn: ['Argentina', 'Spain'],
        phonesContains: '555444333',
      }, // filters
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
      items: [{ id: 1, name: 'John', types: [], phones: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchGuests(
      { page: 3, pageSize: 50 }, // pagination
      {
        globalSearch: 'john',
        nameContains: 'doe',
        documentContains: '222222',
        countryIn: ['Argentina', 'Spain'],
        inHouseOnly: true,
      }, // filters
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
      items: [{ id: 1, name: 'John', types: [], phones: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchAgencies(
      { page: 3, pageSize: 50 }, // pagination
      {
        globalSearch: 'john',
        nameContains: 'doe',
        emailContains: 'johndoe@test.com',
        countryIn: ['Argentina', 'Spain'],
        phonesContains: '222222',
      }, // filters
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
      items: [{ id: 1, name: 'John', types: [], phones: [] }],
    };
    vi.mocked(api.get).mockResolvedValue({ data });

    await repo.fetchSuppliers(
      { page: 3, pageSize: 50 }, // pagination
      {
        globalSearch: 'john',
        nameContains: 'doe',
        vatContains: '222222',
        emailContains: 'johndoe@test.com',
        countryIn: ['Argentina', 'Spain'],
        phonesContains: '222222',
      }, // filters
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

  it('fetchContactById should call GET /contacts/:id and GET return data', async () => {
    const contact = {
      id: 123,
      fistname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      contactType: 'person',
    };
    vi.mocked(api.get).mockResolvedValue({ data: contact });

    const result = await repo.fetchContactById(123);

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/contacts/123');
    expect(result).toBe(contact);
  });
  it('fetchContactPersonalDocuments should call GET /contacts/:id/documents and return data', async () => {
    const documents = [
      { id: 1, name: 'Document 1' },
      { id: 2, name: 'Document 2' },
    ];
    vi.mocked(api.get).mockResolvedValue({ data: documents });

    const result = await repo.fetchContactPersonalDocuments(123);

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/contacts/123/id-numbers');
    expect(result).toBe(documents);
  });

  it('fetchContactSchema should call GET /contacts/extra-features and return data', async () => {
    const apiPayload = ['lastname2'];
    vi.mocked(api.get).mockResolvedValue({ data: apiPayload });

    const result = await repo.fetchContactSchema();

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/contacts/extra-features');

    expect(result).toEqual({ fields: apiPayload });
  });

  it('propagates axios errors when fetch CONTACTS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchContacts({ page: 1, pageSize: 10 })).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch AGENCIES', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchAgencies({ page: 1, pageSize: 10 })).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch CUSTOMERS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchCustomers({ page: 1, pageSize: 10 })).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch GUESTS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchGuests({ page: 1, pageSize: 10 })).rejects.toThrow(err);
  });

  it('propagates axios errors when fetch SUPPLIERS', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchSuppliers({ page: 1, pageSize: 10 })).rejects.toThrow(err);
  });

  it('fetchContactById should propagate axios errors', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchContactById(123)).rejects.toThrow(err);
  });

  it('fetchContactPersonalDocuments should propagate axios errors', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.fetchContactPersonalDocuments(123)).rejects.toThrow(err);
  });

  it('createContact should POST /contacts with normalized payload and return data', async () => {
    const contact = {
      id: 0,
      firstname: 'Ada',
      lastname: 'Lovelace',
      name: 'Ada Lovelace',
      email: 'ada@math.com',
      birthdate: new Date('10/12/1815'),
      residenceStreet: '123 Main St',
      residenceCity: 'London',
      residenceZip: 'E1 6AN',
      residenceCountry: { id: 33, name: 'UK', code: 'GB' },
      residenceState: { id: 20, name: 'England', country: { id: 33, name: 'UK', code: 'GB' } },
      lang: 'en-GB',
      tags: [{ id: 1, name: 'VIP' }],
      pricelist: 0,
      paymentTerm: 0,
      idNumbers: [],
      documents: [
        {
          id: 1,
          name: '123456',
          category: {
            id: 5,
            name: 'Passport',
            code: 'P',
            countries: [{ id: 33, name: 'UK', code: 'GB' }],
            isValidableDocument: true,
          },
          country: { id: 33, name: 'UK', code: 'GB' },
        },
        {
          id: 2,
          name: '11111111H',
          category: { id: 9, name: 'DNI', code: 'D', countries: [], isValidableDocument: false },
          country: { id: 33, name: 'UK', code: 'GB' },
          supportNumber: '111222',
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...contactWithoutId } = contact;
    const apiResponse = { status: 200, data: { id: 99, ...contactWithoutId } };
    vi.mocked((api as any).post).mockResolvedValue(apiResponse);

    const result = await repo.createContact(contact);

    expect((api as any).post).toHaveBeenNthCalledWith(
      1,
      'contacts',
      expect.objectContaining({
        email: 'ada@math.com',
        firstname: 'Ada',
        lang: 'en_GB',
        lastname: 'Lovelace',
        name: 'Ada Lovelace',
        residenceCity: 'London',
        residenceCountry: 33,
        residenceState: 20,
        residenceStreet: '123 Main St',
        residenceZip: 'E1 6AN',
        tags: [1],
      }),
    );
    expect(result).toBe(apiResponse.data);
  });

  it('createContact should POST id-numbers for each document when status=200 and documents exist', async () => {
    const contact = {
      firstname: 'Alan',
      lastname: 'Turing',
      name: 'Alan Turing',
      email: 'alan@math.com',
      residenceCountry: null as unknown as { id: number; name: string; code: string },
      documents: [
        {
          id: 0,
          name: 'Passport',
          category: {
            id: 5,
            name: 'Passport',
            code: 'P',
            countries: [],
            isValidableDocument: true,
          },
          country: { id: 33, name: 'UK', code: 'GB' },
          supportNumber: 'XYZ123',
        },
        {
          id: 0,
          name: 'DNI',
          category: { id: 9, name: 'DNI', code: 'D', countries: [], isValidableDocument: false },
          supportNumber: '111222',
        },
      ],
    };

    vi.mocked((api as any).post).mockResolvedValueOnce({ status: 200, data: { id: 101 } });
    vi.mocked((api as any).post).mockResolvedValue({ status: 200, data: {} });

    await repo.createContact(contact);

    expect((api as any).post).toHaveBeenNthCalledWith(1, 'contacts', expect.any(Object));
    expect((api as any).post).toHaveBeenNthCalledWith(2, 'contacts/101/id-numbers', {
      name: 'Passport',
      category: 5,
      country: 33,
      supportNumber: 'XYZ123',
    });
    expect((api as any).post).toHaveBeenNthCalledWith(3, 'contacts/101/id-numbers', {
      name: 'DNI',
      category: 9,
      country: undefined,
      supportNumber: '111222',
    });
  });

  it('createContact should NOT POST id-numbers when no documents', async () => {
    vi.mocked((api as any).post).mockResolvedValue({ status: 200, data: { id: 500 } });

    await repo.createContact({
      firstname: 'Linus',
      lastname: 'Torvalds',
    });

    expect((api as any).post).toHaveBeenCalledTimes(1);
    expect((api as any).post).toHaveBeenCalledWith('contacts', expect.any(Object));
  });

  it('updateContactFields should PATCH only changed fields', async () => {
    const contactId = 10;
    const original = {
      firstname: 'Marie',
      lastname: 'Curie',
      email: 'marie@chemistry.com',
      tags: [{ id: 2, name: 'Researcher' }],
    };
    const updated = {
      ...original,
      email: 'marie.curie@chemistry.com',
      tags: [],
    };

    await repo.updateContactFields(contactId, original, updated);

    expect((api as any).patch).toHaveBeenCalledWith(
      `contacts/${contactId}`,
      expect.objectContaining({ email: 'marie.curie@chemistry.com' }),
    );
  });

  it('updateContactFields should POST new documents and PATCH existing ones', async () => {
    const contactId = 77;
    const original = {
      firstname: 'Albert',
      lastname: 'Einstein',
      documents: [
        {
          id: 1,
          name: '11111111H',
          category: { id: 9, name: 'DNI', code: 'D', countries: [], isValidableDocument: false },
          country: { id: 33, name: 'UK', code: 'GB' },
          supportNumber: '111222',
        },
      ],
    };
    const updated = {
      ...original,
      documents: [
        {
          id: 0,
          name: '123456',
          category: {
            id: 5,
            name: 'Passport',
            code: 'P',
            countries: [{ id: 33, name: 'UK', code: 'GB' }],
            isValidableDocument: true,
          },
          country: { id: 33, name: 'UK', code: 'GB' },
        },
        {
          id: 1,
          name: '11111111H',
          category: { id: 9, name: 'DNI', code: 'D', countries: [], isValidableDocument: false },
          country: { id: 33, name: 'UK', code: 'GB' },
          supportNumber: '111333',
        },
      ],
    };

    await repo.updateContactFields(contactId, original, updated);

    expect((api as any).patch).toHaveBeenNthCalledWith(
      1,
      `contacts/${contactId}`,
      expect.any(Object),
    );

    expect((api as any).post).toHaveBeenCalledWith(
      `contacts/${contactId}/id-numbers`,
      expect.objectContaining({
        name: '123456',
        category: 5,
        country: 33,
      }),
    );

    expect((api as any).patch).toHaveBeenCalledWith(
      `contacts/${contactId}/id-numbers/1`,
      expect.objectContaining({
        name: '11111111H',
        category: 9,
        country: 33,
        supportNumber: '111333',
      }),
    );

    expect((api as any).patch).not.toHaveBeenCalledWith(
      `contacts/${contactId}/id-numbers/1`,
      expect.objectContaining({ supportNumber: '111222' }),
    );
  });

  it('checkContactDuplicateByDocument should call GET /contacts/duplicate/id-numbers and return data', async () => {
    const apiResponse = { id: 55, name: 'Existing Contact' };
    vi.mocked(api.get).mockResolvedValue({ data: apiResponse });

    const result = await repo.checkContactDuplicateByDocument(3, 'ABC123456', 33);

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);

    const [[url, cfg]] = vi.mocked(api.get).mock.calls;
    expect(url).toBe('/contacts/duplicate/id-numbers');
    expect(cfg).toBeDefined();
    expect(cfg!.params).toBeInstanceOf(URLSearchParams);

    const p = cfg!.params as URLSearchParams;
    expect(p.get('category')).toBe('3');
    expect(p.get('number')).toBe('ABC123456');
    expect(p.get('country')).toBe('33');

    expect(p.toString()).toBe('category=3&number=ABC123456&country=33');

    expect(result).toBe(apiResponse);
  });

  it('checkContactDuplicateByDocument should propagate axios errors', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(repo.checkContactDuplicateByDocument(3, 'ABC123456', 33)).rejects.toThrow(err);
  });

  it('checkContactDuplicateByFiscalDocument calls GET and returns data', async () => {
    const apiResponse = { id: 66, name: 'Existing Contact' };
    vi.mocked(api.get).mockResolvedValue({ data: apiResponse });

    const result = await repo.checkContactDuplicateByFiscalDocument('VAT', 'ESX12345678', 33);

    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1);

    const [[url, cfg]] = vi.mocked(api.get).mock.calls;
    expect(url).toBe('/contacts/duplicate/fiscal-number');
    expect(cfg).toBeDefined();
    expect(cfg!.params).toBeInstanceOf(URLSearchParams);

    const p = cfg!.params as URLSearchParams;
    const sent = Object.fromEntries(p.entries());

    const category = sent.category ?? sent.type ?? sent.documentType ?? sent.documentTypeName;

    expect(category).toBe('VAT');
    expect(sent.number).toBe('ESX12345678');
    expect(sent.country).toBe('33');

    expect(result).toBe(apiResponse);
  });

  it('checkContactDuplicateByFiscalDocument should propagate axios errors', async () => {
    const err = new Error('axios fail');
    vi.mocked(api.get).mockRejectedValue(err);

    await expect(
      repo.checkContactDuplicateByFiscalDocument('VAT', 'ESX12345678', 33),
    ).rejects.toThrow(err);
  });
});
