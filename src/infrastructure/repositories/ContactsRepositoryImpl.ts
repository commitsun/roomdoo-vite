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
  ContactSchema,
} from '@/domain/entities/Contact';
import type { PersonalDocument } from '@/domain/entities/PersonalDocument';
import type { ContactsRepository } from '@/domain/repositories/ContactsRepository';
import type { EntityListResponse } from '@/domain/repositories/EntityListResponse';
import type { Pagination } from '@/domain/repositories/Pagination';
import { api } from '@/infrastructure/http/axios';

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

function buildQueryParamsFromFilters(opts: {
  globalSearch?: string;
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
      lastReservationDate: new Date(
        parseInt(raw.lastReservationDate.split('-')[0]),
        parseInt(raw.lastReservationDate.split('-')[1]) - 1,
        parseInt(raw.lastReservationDate.split('-')[2]),
      ),
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
  async fetchContactSchema(): Promise<ContactSchema> {
    const url = '/contacts/extra-features';
    const { data } = await api.get<string[]>(url);
    return { fields: data };
  }
  async persistContactDocument(contactId: number, document: PersonalDocument): Promise<void> {
    const payload = {
      name: document.name,
      category: document.category.id,
      country: document.country?.id,
      supportNumber: document.supportNumber,
    };
    await api.post(`contacts/${contactId}/id-numbers`, payload);
  }

  normalizeContactPayload = (contact: Partial<ContactDetail>) => {
    const birthdate =
      contact.birthdate instanceof Date ? contact.birthdate.toISOString().split('T')[0] : undefined;

    return Object.fromEntries(
      Object.entries({ ...contact, birthdate })
        .map(([k, v]) => {
          if (k === 'firstName') return ['firstname', v] as const;
          if (k === 'lastName') return ['lastname', v] as const;
          if (k === 'lastName2') return ['lastname2', v] as const;
          if (k === 'nationalityId') return ['nationality', v] as const;
          if (k === 'phoneNumber') return ['phones', [{ number: v, type: 'mobile' }]] as const;
          if (k === 'stateId') return ['state', v] as const;
          if (k === 'countryId') return ['country', v] as const;
          if (k === 'paymentTermId') return ['paymentTerm', v] as const;
          if (k === 'pricelistId') return ['pricelist', v] as const;

          return [k, v] as const;
        })
        .filter(
          ([, v]) =>
            v !== undefined &&
            v !== '' &&
            v !== null &&
            v !== 0 &&
            (!Array.isArray(v) || v.length > 0)
        )
    ) as Partial<ContactDetail>;
  };

  async createContact(contact: Partial<ContactDetail>): Promise<void> {
    const payload = this.normalizeContactPayload(contact);
    await api.post('contacts', payload);
  }

  async updateContactFields(
    contactId: number,
    original: Partial<ContactDetail>,
    updated: Partial<ContactDetail>
  ): Promise<void> {
    const changed: Partial<ContactDetail> = {};

    original = this.normalizeContactPayload(original);
    updated = this.normalizeContactPayload(updated);
    console.log('Original:', original);
    console.log('Updated:', updated);
    for (const [key, value] of Object.entries(updated)) {
      const originalValue = (original as any)[key];

      if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
        (changed as any)[key] = value;
      }
    }
    const payload = this.normalizeContactPayload(changed);
    console.log('Payload:', payload);
    await api.patch(`contacts/${contactId}`, payload);
  }
}
