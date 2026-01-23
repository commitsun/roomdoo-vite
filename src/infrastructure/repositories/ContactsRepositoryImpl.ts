import type {
  AgencyFilters,
  ContactFilters,
  CustomerFilters,
  GuestFilters,
  SupplierFilters,
} from '@/domain/contact/ContactFilters';
import type {
  Agency,
  Contact,
  Customer,
  Guest,
  GuestDTO,
  Supplier,
  ContactDetail,
} from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Pagination } from '@/domain/repositories/Pagination';
import { api } from '@/infrastructure/http/axios';

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

function buildQueryParamsFromFilters(opts: {
  globalSearch?: string;
  pmsPropertyId?: number;
  nameContains?: string;
  documentContains?: string;
  emailContains?: string;
  countryIn?: string[];
  typeIn?: string[];
  phonesContains?: string;
  vatContains?: string;
  inHouseOnly?: boolean;
  checkinDateFrom?: Date;
  checkinDateTo?: Date;
}): URLSearchParams {
  const params = new URLSearchParams();

  // Scalars — only set when non-empty string
  if (isNonEmptyString(opts.globalSearch)) {
    params.set('globalSearch', opts.globalSearch.trim());
  }
  if (typeof opts.pmsPropertyId === 'number') {
    params.set('pmsPropertyId', String(opts.pmsPropertyId));
  }
  if (isNonEmptyString(opts.nameContains)) {
    params.set('name', opts.nameContains.trim());
  }
  if (isNonEmptyString(opts.emailContains)) {
    params.set('email', opts.emailContains.trim());
  }
  if (isNonEmptyString(opts.documentContains)) {
    params.set('vat', opts.documentContains.trim());
  }

  // Arrays — check length explicitly and filter empty items
  if (Array.isArray(opts.typeIn) && opts.typeIn.length > 0) {
    for (const t of opts.typeIn) {
      params.append('types', t);
    }
  }
  if (isNonEmptyString(opts.phonesContains)) {
    params.set('phone', opts.phonesContains.trim());
  }
  if (Array.isArray(opts.countryIn) && opts.countryIn.length > 0) {
    for (const c of opts.countryIn) {
      params.append('countries', c.trim());
    }
  }

  // Override VAT if specific vatContains provided
  if (isNonEmptyString(opts.vatContains)) {
    params.set('vat', opts.vatContains.trim());
  }

  // Boolean — include only if property is present (even if false)
  if ('inHouseOnly' in opts) {
    params.set('inHouse', String(Boolean(opts.inHouseOnly)));
  }
  // Date range — include only if property is present
  if (opts.checkinDateFrom instanceof Date) {
    params.set('checkinDateFrom', opts.checkinDateFrom.toISOString().split('T')[0]);
  }
  if (opts.checkinDateTo instanceof Date) {
    params.set('checkinDateTo', opts.checkinDateTo.toISOString().split('T')[0]);
  }
  return params;
}

export class ContactsRepositoryImpl implements ContactsRepository {
  async fetchContacts(
    pagination: Pagination,
    filters?: ContactFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Contact>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/contacts?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Contact>>(url);
    return data;
  }

  async fetchCustomers(
    pagination: Pagination,
    filters?: CustomerFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Customer>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/customers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Customer>>(url);
    return data;
  }

  async fetchGuests(
    pagination: Pagination,
    filters?: GuestFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Guest>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/guests?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<GuestDTO>>(url);

    const guests: Guest[] = data.items.map((raw) => ({
      id: raw.id,
      name: raw.name,
      country: raw.country,
      identificationDocuments: raw.identificationDocuments,
      inHouse: raw.inHouse,
      internalNotes: raw.internalNotes,
      image: raw.image,
      lastReservationDate: new Date(
        parseInt(raw.lastReservationDate.split('-')[0]),
        parseInt(raw.lastReservationDate.split('-')[1]) - 1,
        parseInt(raw.lastReservationDate.split('-')[2]),
      ),
      lastReservation: raw.lastReservation ?? { id: 0, name: '' },
    }));

    return { ...data, items: guests };
  }

  async fetchAgencies(
    pagination: Pagination,
    filters?: AgencyFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Agency>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/agencies?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Agency>>(url);
    return data;
  }

  async fetchSuppliers(
    pagination: Pagination,
    filters?: SupplierFilters,
    orderBy?: string,
  ): Promise<EntityListResponse<Supplier>> {
    const params = buildQueryParamsFromFilters({
      ...filters,
    });
    params.set('page', String(pagination.page));
    params.set('page_size', String(pagination.pageSize));

    if (isNonEmptyString(orderBy)) {
      params.set('orderBy', orderBy.trim());
    }

    const url = `/suppliers?${params.toString()}`;
    const { data } = await api.get<EntityListResponse<Supplier>>(url);
    return data;
  }
  async fetchContactById(id: number): Promise<ContactDetail> {
    const url = `/contacts/${id}`;
    const { data } = await api.get<ContactDetail>(url);
    return data;
  }
  async fetchContactPersonalDocuments(contactId: number): Promise<PersonalDocument[]> {
    const url = `/contacts/${contactId}/id-numbers`;
    const { data } = await api.get<PersonalDocument[]>(url);
    return data;
  }
  normalizeContactPayload = (contact: Partial<ContactDetail>): Partial<ContactDetail> => {
    const KEY_MAP: Record<string, string> = {
      name: 'name',
      firstName: 'firstname',
      lastName: 'lastname',
      lastName2: 'lastname2',
    };

    const ID_FIELDS = new Set([
      'nationality',
      'residenceState',
      'residenceCountry',
      'state',
      'country',
      'saleChannel',
    ]);

    const toId = (v: unknown): unknown =>
      v !== null && typeof v === 'object' && 'id' in v ? (v as { id: unknown }).id : v;

    const normalizeLocale = (v: unknown): unknown => {
      if (typeof v !== 'string' || v.trim() === '') {
        return '';
      }
      const [lang, region] = (v as string).replace('-', '_').split('_');
      return `${lang.toLowerCase()}_${region.toUpperCase()}`;
    };

    const normalizeTags = (v: unknown): number[] => {
      return Array.from(new Set((v as { id: number }[]).map((tag) => tag.id)));
    };

    const normalizeBirthdate = (v: unknown): string => {
      if (!(v instanceof Date)) {
        return '';
      }

      const d = v as Date;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    const FIELD_TRANSFORMS: Record<string, (v: unknown) => unknown> = {
      tags: normalizeTags,
      lang: normalizeLocale,
      birthdate: normalizeBirthdate,
      id: () => null,
      pricelist: () => null,
      idNumbers: () => null,
    };

    const isPresent = (v: unknown): boolean => v !== undefined && v !== null && v !== '' && v !== 0;

    return Object.fromEntries(
      Object.entries(contact)
        .map(([k, v]) => {
          const mappedKey = KEY_MAP[k] ?? k;
          const transformer = FIELD_TRANSFORMS[mappedKey];
          const mappedVal =
            typeof transformer === 'function'
              ? transformer(v)
              : ID_FIELDS.has(mappedKey)
                ? toId(v)
                : v;
          return [mappedKey, mappedVal] as const;
        })
        .filter(([, v]) => isPresent(v)),
    ) as Partial<ContactDetail>;
  };

  async createContact(contact: Partial<ContactDetail>): Promise<ContactDetail> {
    const payload = this.normalizeContactPayload(contact);
    if (payload.documents) {
      delete payload.documents;
    }
    const response = await api.post('contacts', payload);
    if (response.status === 200 && contact.documents && contact.documents.length > 0) {
      const contactId = response.data.id;
      await Promise.all(
        contact.documents.map(async (document: PersonalDocument): Promise<void> => {
          await api.post(`contacts/${contactId}/id-numbers`, {
            name: document.name,
            category: document.category.id,
            country: document.country?.id,
            supportNumber: document.supportNumber,
          });
        }),
      );
    }
    return response.data;
  }

  async updateContactFields(
    contactId: number,
    original: Partial<ContactDetail>,
    updated: Partial<ContactDetail>,
  ): Promise<void> {
    const changed: Partial<ContactDetail> = {};
    const payloadOriginal = this.normalizeContactPayload(original);
    const payloadUpdated = this.normalizeContactPayload(updated);
    if (payloadOriginal.documents) {
      delete payloadOriginal.documents;
    }
    if (payloadUpdated.documents) {
      delete payloadUpdated.documents;
    }
    for (const [key, value] of Object.entries(payloadUpdated)) {
      const typedKey = key as keyof ContactDetail;
      const originalValue = payloadOriginal[typedKey];

      if (JSON.stringify(value) !== JSON.stringify(originalValue) && value !== null) {
        (changed as Record<string, unknown>)[typedKey] = value;
      }
    }
    await api.patch(`contacts/${contactId}`, payloadUpdated);
    if (updated.documents) {
      await Promise.all(
        updated.documents.map((document: PersonalDocument) => {
          if (!Boolean(document.id)) {
            return api.post(`contacts/${contactId}/id-numbers`, {
              name: document.name,
              category: document.category.id,
              country: document.country?.id,
              supportNumber: document.supportNumber,
            });
          } else {
            return api.patch(`contacts/${contactId}/id-numbers/${document.id}`, {
              name: document.name,
              category: document.category.id,
              country: document.country?.id,
              supportNumber: document.supportNumber,
            });
          }
        }),
      );
      const updatedIds = new Set(
        updated.documents.filter((doc) => Boolean(doc.id)).map((doc) => doc.id) as number[],
      );
      const originalDocs = original.documents ?? [];
      await Promise.all(
        originalDocs
          .filter((doc) => Boolean(doc.id) && !updatedIds.has(doc.id as number))
          .map((doc) => api.delete(`contacts/${contactId}/id-numbers/${doc.id}`)),
      );
    }
  }
  async checkContactDuplicateByDocument(
    documentTypeId: number,
    documentNumber: string,
    countryId: number,
  ): Promise<{ id: number; name: string } | null> {
    const params = new URLSearchParams();
    params.set('category', documentTypeId.toString());
    params.set('number', documentNumber);
    params.set('country', countryId.toString());

    const url = '/contacts/duplicate/id-numbers';
    const { data } = await api.get<{ id: number; name: string } | null>(url, { params });
    return data;
  }

  async checkContactDuplicateByFiscalDocument(
    fiscalDocumentType: string,
    fiscalDocumentNumber: string,
    countryId?: number,
  ): Promise<{ id: number; name: string } | null> {
    const params = new URLSearchParams();
    params.set('type', fiscalDocumentType);
    params.set('number', fiscalDocumentNumber);
    if (countryId !== undefined) {
      params.set('country', countryId.toString());
    }

    const url = '/contacts/duplicate/fiscal-number';
    const { data } = await api.get<{ id: number; name: string } | null>(url, { params });
    return data;
  }
  async updateFiscalNumber(contactId: number, fiscalNumberId: number): Promise<void> {
    const url = `/contacts/${contactId}/id-numbers/${fiscalNumberId}/set-fiscal-number`;
    await api.put(url);
  }
}
