import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
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

import SuppliersPage from './SuppliersPage.vue';

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
    'contacts.selectCountries': 'Select countries',
    'contacts.n_countries_selected': '{count} selected',
    'contacts.detail': 'Contact detail',
  };
  return {
    useI18n: () => ({
      t: (k: string, params?: any) =>
        k === 'contacts.n_countries_selected' && params !== undefined && params !== null
          ? ''
          : tMap[k] ?? k,
    }),
    createI18n: vi.fn(() => ({ install: () => {} })),
  };
});
vi.mock('@/infrastructure/plugins/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'en-ES' },
    },
  },
}));

// Legacy/dialog mocks
vi.mock('@/_legacy/components/partners/PartnerForm.vue', () => ({
  default: { name: 'PartnerForm', template: '<div />' },
}));
vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({
    fetchAndSetVuexPartnerAndActiveProperty: vi.fn().mockResolvedValue(undefined),
  }),
}));
vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ open: vi.fn() }),
}));

// Datos de prueba
const testSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Acme Corp',
    email: 'billing@acme.com',
    vat: 'ESB12345678',
    phones: [],
    country: { code: 'ES', name: 'Spain', id: 1 },
    totalInvoiced: 4200,
  },
  {
    id: 2,
    name: 'Globex Ltd',
    email: 'sales@globex.co',
    vat: 'PT999888777',
    phones: [{ number: '555-123-456', type: 'mobile' }],
    country: { code: 'PT', name: 'Portugal', id: 2 },
    totalInvoiced: 98765,
  },
];

const mockContactsStore = {
  suppliers: testSuppliers,
  contactsCount: testSuppliers.length,
  fetchSuppliers: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => mockContactsStore,
}));

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
    render(SuppliersPage, {
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

  it('renders suppliers by default - happy path - fetches on mount', async () => {
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');

    expect(bodyRows).toHaveLength(2);

    // row 1
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent('Acme Corp'); // name
    expect(within(bodyRows[0]).getAllByRole('cell')[1]).toHaveTextContent('ESB12345678'); // VAT
    expect(within(bodyRows[0]).getAllByRole('cell')[2]).toHaveTextContent('billing@acme.com'); // email
    expect(within(bodyRows[0]).getAllByRole('cell')[3]).toHaveTextContent(''); // phone (empty)
    expect(within(bodyRows[0]).getAllByRole('cell')[4]).toHaveTextContent('Spain'); // country
    expect(within(bodyRows[0]).getAllByRole('cell')[5]).toHaveTextContent('4.200,00'); // totalInvoiced

    // row 2
    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent('Globex Ltd');
    expect(within(bodyRows[1]).getAllByRole('cell')[1]).toHaveTextContent('PT999888777');
    expect(within(bodyRows[1]).getAllByRole('cell')[2]).toHaveTextContent('sales@globex.co');
    expect(within(bodyRows[1]).getAllByRole('cell')[3].innerHTML).toContain('555-123-456'); // phone chip
    expect(within(bodyRows[1]).getAllByRole('cell')[4]).toHaveTextContent('Portugal');
    expect(within(bodyRows[1]).getAllByRole('cell')[5]).toHaveTextContent('98.765,00');
  });

  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Acme');
    vi.advanceTimersByTime(300);
    const last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[2]).toBe('Acme');
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
    const header = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(header); // asc
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[8]).toBe('name');

    await userEvent.click(header); // desc
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[8]).toBe('-name');
  });

  it('sort by email toggles and maps orderBy', async () => {
    const header = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(header); // asc
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[8]).toBe('email');

    await userEvent.click(header); // desc
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[8]).toBe('-email');
  });

  it('sort by country toggles and maps orderBy', async () => {
    const header = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(header); // asc
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[8]).toBe('country');

    await userEvent.click(header); // desc
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[8]).toBe('-country');
  });

  it('filters by name and clears with Clear', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(overlay).getByPlaceholderText(/search by name/i), 'Acme');
    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[3]).toBe('Acme');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[3]).toBeUndefined();
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
    expect(last && last[5]).toBe('ESB12345678');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last && last[5]).toBeUndefined();
  });

  it('filters by email and clears with Clear', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    const filterBtn = within(emailHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(
      within(overlay).getByPlaceholderText(/search by email/i),
      'billing@acme.com'
    );
    await userEvent.click(within(overlay).getByRole('button', { name: /apply/i }));

    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[4]).toBe('billing@acme.com');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[4]).toBeUndefined();
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
    expect(last?.[7]).toBe('555');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[7]).toBeUndefined();
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
    expect(last?.[6]).toEqual(['Spain']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[6]).toBeUndefined();
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
    expect(last?.[6]).toHaveLength(2);
    expect(last?.[6]).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });

  it('applies all filters + global search and clears everything with "Clear all" button', async () => {
    mockContactsStore.fetchSuppliers.mockClear();

    // Global
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await userEvent.type(globalInput, 'global');

    // Nombre
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(within(nameHeader).getByRole('button'));
    const nameOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'Acme');
    await userEvent.click(within(nameOverlay).getByRole('button', { name: /apply/i }));

    // VAT
    const vatHeader = screen.getByRole('columnheader', { name: /vat/i });
    await userEvent.click(within(vatHeader).getByRole('button'));
    const vatOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(vatOverlay).getByPlaceholderText(/search by vat/i), 'ESB12345678');
    await userEvent.click(within(vatOverlay).getByRole('button', { name: /apply/i }));

    // Email
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(within(emailHeader).getByRole('button'));
    const emailOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(
      within(emailOverlay).getByPlaceholderText(/search by email/i),
      'billing@acme.com'
    );
    await userEvent.click(within(emailOverlay).getByRole('button', { name: /apply/i }));

    // Phone
    const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
    await userEvent.click(within(phoneHeader).getByRole('button'));
    const phoneOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(phoneOverlay).getByPlaceholderText(/search by phone/i), '555');
    await userEvent.click(within(phoneOverlay).getByRole('button', { name: /apply/i }));

    // Country
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(within(countryHeader).getByRole('button'));
    const countryOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(countryOverlay).queryByRole('combobox', { name: /select countries/i }) ??
      within(countryOverlay).getByText(/select countries/i);
    await userEvent.click(trigger);
    const listboxCountry = await screen.findByRole('listbox');
    await userEvent.click(within(listboxCountry).getByRole('option', { name: /spain/i }));
    await userEvent.click(within(countryOverlay).getByRole('button', { name: /apply/i }));

    // Sort country desc
    await userEvent.click(countryHeader); // asc
    await userEvent.click(countryHeader); // desc

    // Verificar argumentos (orden en fetchSuppliers)
    let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBe('global'); // global
    expect(last?.[3]).toBe('Acme'); // name
    expect(last?.[4]).toBe('billing@acme.com'); // email
    expect(last?.[5]).toBe('ESB12345678'); // vat
    expect(last?.[6]).toEqual(['Spain']); // countries
    expect(last?.[7]).toBe('555'); // phone
    expect(last?.[8]).toBe('-country'); // orderBy

    // Clear all
    const clearAllBtn = screen.getByRole('button', { name: /clear global search/i });
    await userEvent.click(clearAllBtn);

    last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
    expect(last?.[2]).toBeUndefined();
    expect(last?.[3]).toBeUndefined();
    expect(last?.[4]).toBeUndefined();
    expect(last?.[5]).toBeUndefined();
    expect(last?.[6]).toBeUndefined();
    expect(last?.[7]).toBeUndefined();
    expect(last?.[8]).toBeUndefined();

    expect(globalInput).toHaveValue('');
  });
});
