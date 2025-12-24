import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import CountryFlag from 'vue-country-flag-next';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

import SupplierList from './SupplierList.vue';

import type { Supplier } from '@/domain/entities/Contact';
import primevuePlugin from '@/infrastructure/plugins/primevue';
// i18n mock
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.globalSearch': 'Global search',
    'contacts.clear': 'Clear',
    'contacts.fullName': 'Full name',
    'contacts.vat': 'VAT',
    'contacts.email': 'Email',
    'contacts.phone': 'Phone',
    'contacts.country': 'Country',
    'contacts.totalInvoiced': 'Total invoiced',
    'contacts.searchByName': 'Search by name',
    'contacts.searchByEmail': 'Search by email',
    'contacts.searchByVat': 'Search by VAT',
    'contacts.searchByCountry': 'Select countries',
    'contacts.n_countries_selected': '{count} selected',
    'contacts.detail': 'Contact detail',
  };
  return {
    useI18n: () => ({
      t: (k: string, params?: any) =>
        k === 'contacts.n_countries_selected' && params !== undefined && params !== null
          ? ''
          : (tMap[k] ?? k),
    }),
    createI18n: vi.fn(() => ({ install: () => {} })),
  };
});
// i18n plugin mock (locale)
vi.mock('@/infrastructure/plugins/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'es-ES' },
    },
  },
}));
// Legacy/dialog mocks
vi.mock('@/_legacy/components/partners/PartnerForm.vue', () => ({
  default: { name: 'PartnerForm', template: '<div />' },
}));
// Legacy store mock
vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({
    fetchAndSetVuexPartnerAndActiveProperty: vi.fn().mockResolvedValue(undefined),
  }),
}));
// App dialog mock
vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ open: vi.fn() }),
}));
// pmsProperties store mock
vi.mock('@/infrastructure/stores/pmsProperties', () => ({
  usePmsPropertiesStore: () => ({
    currentPmsPropertyId: 'prop-1',
    pmsProperties: [{ id: 'prop-1', currency: { code: 'EUR' } }],
  }),
}));
// test data
const testSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Acme Corp',
    email: 'billing@acme.com',
    vat: 'ESB12345678',
    phones: [],
    country: { code: 'ES', name: 'Spain', id: 1 },
    totalInvoiced: 4200,
    image: 'https://example.com/logo.png',
  },
  {
    id: 2,
    name: 'Globex Ltd',
    email: 'sales@globex.co',
    vat: 'PT999888777',
    phones: [{ number: '555-123-456', type: 'mobile' }],
    country: { code: 'PT', name: 'Portugal', id: 2 },
    totalInvoiced: 98765,
    image: '',
  },
];
// Contacts store mock
const mockContactsStore = {
  suppliers: testSuppliers,
  suppliersCount: testSuppliers.length,
  fetchSuppliers: vi.fn().mockResolvedValue(undefined),
};
vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => mockContactsStore,
}));
// Countries store mock
vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => ({
    countries: [
      { id: 1, name: 'Spain', code: 'ES' },
      { id: 2, name: 'Portugal', code: 'PT' },
    ],
    fetchCountries: vi.fn().mockResolvedValue(undefined),
  }),
}));
describe('SuppliersPage', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(SupplierList, {
      props: { total: testSuppliers.length },
      global: {
        plugins: [pinia, [primevuePlugin, { ripple: false }]],
        components: {
          DataTable,
          Column,
          Tag,
          Chip,
          InputText,
          Select,
          MultiSelect,
          Button,
          IconField,
          InputIcon,
          CountryFlag,
        },
      },
    });
  });
  it('renders agencies by default - happy path - fetches on mount', async () => {
    const first = testSuppliers[0];
    const second = testSuppliers[1];
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');
    // renders 2 suppliers
    expect(bodyRows).toHaveLength(2);
    // first row
    expect(bodyRows[0]).toHaveTextContent(first.name);
    expect(bodyRows[0]).toHaveTextContent(first.vat);
    expect(bodyRows[0]).toHaveTextContent(first.email ?? '');
    first.phones?.forEach((phone) => {
      expect(bodyRows[0]).toHaveTextContent(phone.number);
    });
    expect(bodyRows[0]).toHaveTextContent(first.country?.name ?? '');
    expect(bodyRows[0]).toHaveTextContent(
      new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      })
        .format(Number(first.totalInvoiced))
        .replace(/\u00A0/g, ' '),
    );

    // second row
    expect(bodyRows[1]).toHaveTextContent(second.name);
    expect(bodyRows[1]).toHaveTextContent(second.email ?? '');
    expect(bodyRows[1]).toHaveTextContent(second.vat);
    second.phones?.forEach((phone) => {
      expect(bodyRows[1]).toHaveTextContent(phone.number);
    });
    expect(bodyRows[1]).toHaveTextContent(second.country?.name ?? '');
    expect(bodyRows[1]).toHaveTextContent(
      new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      })
        .format(Number(second.totalInvoiced))
        .replace(/\u00A0/g, ' '),
    );
  });
  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Acme');
    vi.advanceTimersByTime(300);
    const last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[1].globalSearch).toBe('Acme');
    vi.useRealTimers();
  });
  it('debounces global search (only one call)', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchSuppliers.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Globex');
    expect(mockContactsStore.fetchSuppliers).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(mockContactsStore.fetchSuppliers).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('fires by maxWait even with continuous typing', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchSuppliers.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'abc');
    vi.advanceTimersByTime(2900);
    await user.type(input, 'def');
    vi.advanceTimersByTime(200); // 3100 > maxWait
    expect(mockContactsStore.fetchSuppliers).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it('sort by name toggles and maps orderBy', async () => {
    const header = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    await userEvent.click(header); // asc
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('name');

    await userEvent.click(header); // desc
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('-name');
  });
  it('sort by email toggles and maps orderBy', async () => {
    const header = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(header); // asc
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('email');

    await userEvent.click(header); // desc
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('-email');
  });
  it('sort by country toggles and maps orderBy', async () => {
    const header = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(header); // asc
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('country');

    await userEvent.click(header); // desc
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('-country');
  });
  it('filters by name and clears with Clear', async () => {
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(overlay).getByPlaceholderText(/search by name/i), 'Acme');
    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBe('Acme');

    const clearBtn = within(overlay).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBeUndefined();
  });
  it('filters by VAT and clears with Clear', async () => {
    const vatHeader = screen.getByRole('columnheader', { name: /vat/i });
    const filterBtn = within(vatHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(overlay).getByPlaceholderText(/search by vat/i), 'ESB12345678');
    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[1].vatContains).toBe('ESB12345678');

    const clearBtn = within(overlay).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[1].vatContains).toBeUndefined();
  });
  it('filters by email and clears with Clear', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    const filterBtn = within(emailHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(
      within(overlay).getByPlaceholderText(/search by email/i),
      'billing@acme.com',
    );
    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].emailContains).toBe('billing@acme.com');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].emailContains).toBeUndefined();
  });
  it('filters by phone and clears with Clear', async () => {
    const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
    const filterBtn = within(phoneHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(overlay).getByPlaceholderText(/search by phone/i), '555');
    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].phonesContains).toBe('555');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].phonesContains).toBeUndefined();
  });
  it('filters by country and clears with Clear', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    const filterBtn = within(countryHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(overlay).queryByRole('combobox', { name: /select countries/i }) ??
      within(overlay).getByText(/select countries/i);
    await userEvent.click(trigger);

    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: /spain/i }));

    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].countryIn).toEqual(['Spain']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].countryIn).toBeUndefined();
  });
  it('filters by several countries', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    const filterBtn = within(countryHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(overlay).queryByRole('combobox', { name: /select countries/i }) ??
      within(overlay).getByText(/select countries/i);
    await userEvent.click(trigger);

    const listbox = await screen.findByRole('listbox');
    const spain = within(listbox).getByRole('option', { name: /spain/i });
    const portugal = within(listbox).getByRole('option', { name: /portugal/i });
    await userEvent.click(spain);
    await userEvent.click(portugal);

    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    const last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[1].countryIn).toHaveLength(2);
    expect(last?.[1].countryIn).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });
  it('applies all filters + global search and clears everything with "Clear all" button', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchSuppliers.mockClear();
    // Global search (debounced)
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await user.type(globalInput, 'global');
    // fires debounce (250ms) with marginal
    vi.advanceTimersByTime(250);
    // Name
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    await user.click(within(nameHeader).getByRole('button'));
    const nameOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'Acme');
    await user.click(within(nameOverlay).getByRole('button', { name: /apply/i }));
    // VAT
    const vatHeader = screen.getByRole('columnheader', { name: /vat/i });
    await user.click(within(vatHeader).getByRole('button'));
    const vatOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(within(vatOverlay).getByPlaceholderText(/search by vat/i), 'ESB12345678');
    await user.click(within(vatOverlay).getByRole('button', { name: /apply/i }));
    // Email
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await user.click(within(emailHeader).getByRole('button'));
    const emailOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(
      within(emailOverlay).getByPlaceholderText(/search by email/i),
      'billing@acme.com',
    );
    await user.click(within(emailOverlay).getByRole('button', { name: /apply/i }));
    // Phone
    const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
    await user.click(within(phoneHeader).getByRole('button'));
    const phoneOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(within(phoneOverlay).getByPlaceholderText(/search by phone/i), '555');
    await user.click(within(phoneOverlay).getByRole('button', { name: /apply/i }));
    // Country
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await user.click(within(countryHeader).getByRole('button'));
    const countryOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(countryOverlay).queryByRole('combobox', { name: /select countries/i }) ??
      within(countryOverlay).getByText(/select countries/i);
    await user.click(trigger);
    const listboxCountry = await screen.findByRole('listbox');
    await user.click(within(listboxCountry).getByRole('option', { name: /spain/i }));
    await user.click(within(countryOverlay).getByRole('button', { name: /apply/i }));
    // Sort country
    await user.click(countryHeader); // asc
    await user.click(countryHeader); // desc
    // Assert parameters (order in fetchSuppliers)
    await waitFor(() => {
      const last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[1].globalSearch).toBe('global'); // global
      expect(last?.[1].nameContains).toBe('Acme'); // name
      expect(last?.[1].emailContains).toBe('billing@acme.com'); // email
      expect(last?.[1].vatContains).toBe('ESB12345678'); // vat
      expect(last?.[1].countryIn).toEqual(['Spain']); // countries
      expect(last?.[1].phonesContains).toBe('555'); // phone
      expect(last?.[2]).toBe('-country'); // orderBy
    });
    // Clear all
    const clearAllBtn = screen.getByRole('button', { name: /clear global search/i });
    await user.click(clearAllBtn);
    await waitFor(() => {
      const last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[1].globalSearch).toBeUndefined();
      expect(last?.[1].nameContains).toBeUndefined();
      expect(last?.[1].emailContains).toBeUndefined();
      expect(last?.[1].vatContains).toBeUndefined();
      expect(last?.[1].countryIn).toBeUndefined();
      expect(last?.[1].phonesContains).toBeUndefined();
      expect(last?.[2]).toBeUndefined();
      expect(globalInput).toHaveValue('');
      vi.useRealTimers();
    });
  });
});
