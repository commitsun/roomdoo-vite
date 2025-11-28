import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ContactsService } from './ContactsService';

import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type {
  Contact,
  Customer,
  Guest,
  Agency,
  Supplier,
  ContactDetail,
} from '@/domain/entities/Contact';

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
          lastReservationDate: new Date('2024-06-15'),
        },
        {
          id: 11,
          name: 'Jane',
          identificationDocuments: [],
          lastReservation: { id: 2, name: 'Res 2' },
          lastReservationDate: new Date('2024-06-20'),
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

describe('ContactsService.fetchContactById', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchContactById: vi.fn(), fetchContactPersonalDocuments: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('returns contact data on success', async () => {
    const contact: ContactDetail = {
      id: 1,
      name: 'John Doe',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      residenceStreet: '123 Main St',
      residenceCity: 'Anytown',
      residenceZip: '12345',
      residenceCountry: { id: 1, name: 'United States', code: 'US' },
      residenceState: {
        id: 10,
        name: 'California',
        country: { id: 1, name: 'United States', code: 'US' },
      },
      phones: [
        {
          type: 'MOBILE',
          number: '+1234567890',
        },
      ],
      contactType: 'person',
    };
    const documents = [
      {
        id: 100,
        category: { id: 1, name: 'Passport', code: 'PASSPORT', countries: [] },
        name: 'A1234567',
        country: { id: 1, name: 'United States', code: 'US' },
      },
    ];

    contactsRepoMock.fetchContactById.mockResolvedValue(contact);
    contactsRepoMock.fetchContactPersonalDocuments.mockResolvedValue(documents);

    const result = await contactsService.fetchContactById(1);

    expect(contactsRepoMock.fetchContactById).toHaveBeenCalledWith(1);
    expect(result).toBe(contact);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-contact-detail');
    contactsRepoMock.fetchContactById.mockRejectedValue(err);
    await expect(contactsService.fetchContactById(1)).rejects.toThrow(err);
  });
});

describe('ContactsService.fetchContactSchema', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { fetchContactSchema: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('returns contact schema on success', async () => {
    const schema = {
      fields: ['lastname2'],
    };
    contactsRepoMock.fetchContactSchema.mockResolvedValue(schema);

    const result = await contactsService.fetchContactSchema();

    expect(contactsRepoMock.fetchContactSchema).toHaveBeenCalledTimes(1);
    expect(result).toBe(schema);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-contact-schema');
    contactsRepoMock.fetchContactSchema.mockRejectedValue(err);
    await expect(contactsService.fetchContactSchema()).rejects.toThrow(err);
  });
});

describe('ContactsService.createContact', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { createContact: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('calls repository to create contact', async () => {
    const newContact: ContactDetail = {
      id: 0,
      firstname: 'Jane',
      lastname: 'Smith',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      residenceStreet: '456 Oak St',
      residenceCity: 'Othertown',
      residenceZip: '67890',
      residenceCountry: { id: 2, name: 'Canada', code: 'CA' },
      residenceState: {
        id: 20,
        name: 'Ontario',
        country: { id: 2, name: 'Canada', code: 'CA' },
      },
      phones: [{ type: 'phone', number: '+1987654321' }],
      contactType: 'person',
    };

    contactsRepoMock.createContact.mockResolvedValue(undefined);

    await expect(contactsService.createContact(newContact)).resolves.toBeUndefined();

    expect(contactsRepoMock.createContact).toHaveBeenCalledTimes(1);
    expect(contactsRepoMock.createContact).toHaveBeenCalledWith(newContact);
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-create-contact');
    contactsRepoMock.createContact.mockRejectedValue(err);
    await expect(contactsService.createContact({})).rejects.toThrow(err);
  });
});

describe('ContactsService.updateContact', () => {
  let contactsService: ContactsService;
  let contactsRepoMock: Partial<Record<keyof ContactsRepository, any>>;

  beforeEach(() => {
    contactsRepoMock = { updateContactFields: vi.fn() };
    contactsService = new ContactsService(contactsRepoMock as ContactsRepository);
  });

  it('calls repository to update contact', async () => {
    const originalContact: ContactDetail = {
      id: 1,
      firstname: 'Jane',
      lastname: 'Doe',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      residenceStreet: '789 Pine St',
      residenceCity: 'Newcity',
      residenceZip: '54321',
      residenceCountry: { id: 3, name: 'UK', code: 'GB' },
      residenceState: {
        id: 30,
        name: 'England',
        country: { id: 3, name: 'UK', code: 'GB' },
      },
      phones: [{ type: 'phone', number: '+447700900123' }],
      contactType: 'person',
    };
    const updatedContact: ContactDetail = {
      ...originalContact,
      id: 1,
      lastname: 'Smith',
      email: 'jane.smith@example.com',
    };

    contactsRepoMock.updateContactFields.mockResolvedValue(undefined);

    await expect(
      contactsService.updateContactFields(1, originalContact, updatedContact),
    ).resolves.toBeUndefined();

    expect(contactsRepoMock.updateContactFields).toHaveBeenCalledTimes(1);
    expect(contactsRepoMock.updateContactFields).toHaveBeenCalledWith(
      1,
      originalContact,
      updatedContact,
    );
  });

  it('propagates repository errors', async () => {
    const err = new Error('boom-update-contact');
    contactsRepoMock.updateContactFields.mockRejectedValue(err);
    await expect(contactsService.updateContactFields(0, {}, {})).rejects.toThrow(err);
  });
  describe('ContactsService.checkContactDuplicateByDocument', () => {
    it('calls repository to check contact duplication by document', async () => {
      contactsRepoMock.checkContactDuplicateByDocument = vi
        .fn()
        .mockResolvedValue({ id: 1, name: 'John Doe' });
      const result = await contactsService.checkContactDuplicateByDocument(1, 'A1234567', 1);
      expect(contactsRepoMock.checkContactDuplicateByDocument).toHaveBeenCalledWith(
        1,
        'A1234567',
        1,
      );
      expect(result).toEqual({ id: 1, name: 'John Doe' });
    });
    it('propagates repository errors when checking contact duplication by document', async () => {
      const err = new Error('boom-check-duplicate-document');
      contactsRepoMock.checkContactDuplicateByDocument = vi.fn().mockRejectedValue(err);
      await expect(
        contactsService.checkContactDuplicateByDocument(1, 'A1234567', 1),
      ).rejects.toThrow(err);
    });
  });
  describe('ContactsService.checkContactDuplicateByFiscalDocument', () => {
    it('calls repository to check contact duplication by fiscal document', async () => {
      contactsRepoMock.checkContactDuplicateByFiscalDocument = vi
        .fn()
        .mockResolvedValue({ id: 2, name: 'Jane Smith' });
      const result = await contactsService.checkContactDuplicateByFiscalDocument(
        'FISCAL_ID',
        'F12345678',
        1,
      );
      expect(contactsRepoMock.checkContactDuplicateByFiscalDocument).toHaveBeenCalledWith(
        'FISCAL_ID',
        'F12345678',
        1,
      );
      expect(result).toEqual({ id: 2, name: 'Jane Smith' });
    });
    it('propagates repository errors when checking contact duplication by fiscal document', async () => {
      const err = new Error('boom-check-duplicate-fiscal-document');
      contactsRepoMock.checkContactDuplicateByFiscalDocument = vi.fn().mockRejectedValue(err);
      await expect(
        contactsService.checkContactDuplicateByFiscalDocument('FISCAL_ID', 'F12345678', 1),
      ).rejects.toThrow(err);
    });
  });
});
