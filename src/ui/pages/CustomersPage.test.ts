import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import primevuePlugin from '@/infrastructure/plugins/primevue';

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
import type { Customer } from '@/domain/entities/Contact';
import CustomersPage from './CustomersPage.vue';

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
    'contacts.searchByPhone': 'Search by phone',
    'contacts.selectCountries': 'Select countries',
  };
  return {
    useI18n: () => ({
      t: (k: string) => tMap[k] ?? k,
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

// TODO: remove when legacy components are removed
vi.mock('@/_legacy/components/partners/PartnerForm.vue', () => ({
  default: { name: 'PartnerForm', template: '<div />' },
}));

// TODO: remove when legacy stores are removed
vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({
    fetchAndSetVuexPartnerAndActiveProperty: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ open: vi.fn() }),
}));

// test data customers
const testCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    vat: 'US123456789',
    phones: [],
    country: { code: 'US', name: 'United States', id: 1 },
    totalInvoiced: 1500,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    vat: 'CA987654321',
    phones: [{ number: '555-123-4567', type: 'mobile' }],
    country: { code: 'CA', name: 'Canada', id: 2 },
    totalInvoiced: 2500,
  },
];

const mockContactsStore = {
  customers: testCustomers,
  contactsCount: testCustomers.length,
  fetchCustomers: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => mockContactsStore,
}));

vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => ({
    countries: [
      { id: 1, name: 'United States', code: 'US' },
      { id: 2, name: 'Canada', code: 'CA' },
    ],
    fetchCountries: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('CustomersPage', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(CustomersPage, {
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
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');

    // renders 2 customers
    expect(bodyRows).toHaveLength(2);
    // check 1st row content
    // name
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent(testCustomers[0].name);
    // vat
    expect(within(bodyRows[0]).getAllByRole('cell')[1]).toHaveTextContent(testCustomers[0].vat);
    // email
    expect(within(bodyRows[0]).getAllByRole('cell')[2]).toHaveTextContent(
      testCustomers[0].email ?? ''
    );
    // phones
    expect(within(bodyRows[0]).getAllByRole('cell')[3]).toHaveTextContent(
      testCustomers[0].phones && testCustomers[0].phones.length > 0
        ? testCustomers[0].phones[0].number
        : ''
    );
    // country
    expect(within(bodyRows[0]).getAllByRole('cell')[4]).toHaveTextContent(
      testCustomers[0].country?.name ?? ''
    );

    //total invoiced
    expect(within(bodyRows[0]).getAllByRole('cell')[5]).toHaveTextContent(
      testCustomers[0].totalInvoiced.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      })
    );
    // check 2nd row content
    // name
    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent(testCustomers[1].name);
    // vat
    expect(within(bodyRows[1]).getAllByRole('cell')[1]).toHaveTextContent(testCustomers[1].vat);
    // email
    expect(within(bodyRows[1]).getAllByRole('cell')[2]).toHaveTextContent(
      testCustomers[1].email ?? ''
    );

    // phones
    expect(within(bodyRows[1]).getAllByRole('cell')[3].innerHTML).toContain(
      testCustomers[1].phones && testCustomers[1].phones.length > 0
        ? testCustomers[1].phones[0].number
        : ''
    );
    // country
    expect(within(bodyRows[1]).getAllByRole('cell')[4]).toHaveTextContent(
      testCustomers[1].country?.name ?? ''
    );
  });

  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'John');
    vi.advanceTimersByTime(300);

    const last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last && last[2]).toBe('John');

    vi.useRealTimers();
  });

  it('debounces global search (only one call)', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchCustomers.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'John');

    expect(mockContactsStore.fetchCustomers).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(mockContactsStore.fetchCustomers).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('fires by maxWait even with continuous typing', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchCustomers.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'abc');
    vi.advanceTimersByTime(2900);
    await user.type(input, 'def');
    vi.advanceTimersByTime(200); // 3100 > maxWait

    expect(mockContactsStore.fetchCustomers).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('sort by name toggles and maps orderBy', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(nameHeader); // asc
    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[8]).toBe('name');

    await userEvent.click(nameHeader); // desc
    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[8]).toBe('-name');
  });

  it('sort by email toggles and maps orderBy', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(emailHeader); // asc
    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[8]).toBe('email');

    await userEvent.click(emailHeader); // desc
    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[8]).toBe('-email');
  });

  it('sort by country toggles and maps orderBy', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(countryHeader); // asc
    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[8]).toBe('country');

    await userEvent.click(countryHeader); // desc
    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[8]).toBe('-country');
  });

  it('filters by name (column filter + apply) & clear input after click clear button', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const nameInput = within(overlay).getByPlaceholderText(/search by name/i);
    await userEvent.type(nameInput, 'John');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last && last[3]).toBe('John');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last && last[3]).toBeUndefined();
  });

  it('filters by vat (column filter + apply) & clear input after click clear button', async () => {
    const vatHeader = screen.getByRole('columnheader', { name: /vat/i });
    const filterBtn = within(vatHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const vatInput = within(overlay).getByPlaceholderText(/search by vat/i);
    await userEvent.type(vatInput, 'US123456789');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last && last[5]).toBe('US123456789');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last && last[5]).toBeUndefined();
  });

  it('filters by email (column filter + apply) & clears with clear button', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    const filterBtn = within(emailHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const emailInput = within(overlay).getByPlaceholderText(/search by email/i);
    await userEvent.type(emailInput, 'john.doe@example.com');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[4]).toBe('john.doe@example.com');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[4]).toBeUndefined();
  });

  it('filters by phone (column filter + apply) & clears with clear button', async () => {
    const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
    const filterBtn = within(phoneHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const phoneInput = within(overlay).getByPlaceholderText(/search by phone/i);
    await userEvent.type(phoneInput, '555');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[7]).toBe('555'); // phone index en fetchCustomers

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[7]).toBeUndefined();
  });

  it('filters by country & clears country filter', async () => {
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
    const usOption = within(listbox).getByRole('option', { name: /united states/i });
    await userEvent.click(usOption);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[6]).toEqual(['United States']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
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
    const usOption = within(listbox).getByRole('option', { name: /united states/i });
    const canadaOption = within(listbox).getByRole('option', { name: /canada/i });
    await userEvent.click(usOption);
    await userEvent.click(canadaOption);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    const last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[6]).toHaveLength(2);
    expect(last?.[6]).toEqual(expect.arrayContaining(['United States', 'Canada']));
  });

  it('applies all filters + global search and clears everything with "Clear all" button', async () => {
    mockContactsStore.fetchCustomers.mockClear();

    // Global search
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await userEvent.type(globalInput, 'global');

    // Name
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(within(nameHeader).getByRole('button'));
    const nameOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'John');
    await userEvent.click(within(nameOverlay).getByRole('button', { name: /apply/i }));

    // Vat
    const vatHeader = screen.getByRole('columnheader', { name: /vat/i });
    await userEvent.click(within(vatHeader).getByRole('button'));
    const vatOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(vatOverlay).getByPlaceholderText(/search by vat/i), 'US123456789');
    await userEvent.click(within(vatOverlay).getByRole('button', { name: /apply/i }));

    // Email
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(within(emailHeader).getByRole('button'));
    const emailOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(
      within(emailOverlay).getByPlaceholderText(/search by email/i),
      'john.doe@example.com'
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
    const countryTrigger =
      within(countryOverlay).queryByRole('combobox', { name: /select countries/i }) ??
      within(countryOverlay).getByText(/select countries/i);
    await userEvent.click(countryTrigger);
    const listboxCountry = await screen.findByRole('listbox');
    await userEvent.click(within(listboxCountry).getByRole('option', { name: /united states/i }));
    await userEvent.click(within(countryOverlay).getByRole('button', { name: /apply/i }));

    // sort by country desc
    await userEvent.click(countryHeader); // asc
    await userEvent.click(countryHeader); // desc

    // Verify last call has all filters set (indexes para fetchAgencies)
    let last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[2]).toBe('global'); // global
    expect(last?.[3]).toBe('John'); // name
    expect(last?.[4]).toBe('john.doe@example.com'); // email
    expect(last?.[5]).toBe('US123456789'); // vat
    expect(last?.[6]).toEqual(['United States']); // countries
    expect(last?.[7]).toBe('555'); // phone
    expect(last?.[8]).toBe('-country'); // orderBy

    // Clear all (header button con label "Clear")
    const clearAllBtn = screen.getByRole('button', { name: /clear global search/i });
    await userEvent.click(clearAllBtn);

    // Todo limpio
    last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
    expect(last?.[2]).toBeUndefined(); // global
    expect(last?.[3]).toBeUndefined(); // name
    expect(last?.[4]).toBeUndefined(); // email
    expect(last?.[5]).toBeUndefined(); // vat
    expect(last?.[6]).toBeUndefined(); // countries
    expect(last?.[7]).toBeUndefined(); // phone
    expect(last?.[8]).toBeUndefined(); // orderBy

    expect(globalInput).toHaveValue('');
  });
});
