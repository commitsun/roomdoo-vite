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
import type { Agency } from '@/domain/entities/Contact';
import AgenciesPage from './AgenciesPage.vue';

// i18n mock
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.globalSearch': 'Global search',
    'contacts.clear': 'Clear',
    'contacts.fullName': 'Full name',
    'contacts.email': 'Email',
    'contacts.phone': 'Phone',
    'contacts.country': 'Country',
    'contacts.searchByName': 'Search by name',
    'contacts.searchByEmail': 'Search by email',
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

// TODO: remove when legacy components are removed
vi.mock('@/_legacy/components/partners/PartnerForm.vue', () => ({
  default: { name: 'PartnerForm', template: '<div />' },
}));

// TODO: remove when legacy stores are removed
vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({
    fetchAndSetVuexPartnerAndACtiveProperty: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ open: vi.fn() }),
}));

// test data agencies
const testAgencies: Agency[] = [
  {
    id: 1,
    name: 'Acme Travel',
    email: 'booking@acme.com',
    phones: [],
    country: { code: 'ES', name: 'Spain', id: 1 },
  },
  {
    id: 2,
    name: 'Globex Agency',
    email: 'contact@globex.pt',
    phones: [
      { number: '555-123-4567', type: 'mobile' },
      { number: '555-987-6543', type: 'phone' },
    ],
    country: { code: 'PT', name: 'Portugal', id: 2 },
  },
];

const mockContactsStore = {
  agencies: testAgencies,
  contactsCount: testAgencies.length,
  fetchAgencies: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => mockContactsStore,
}));

vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => ({
    countries: [
      { id: 1, code: 'ES', name: 'Spain' },
      { id: 2, code: 'PT', name: 'Portugal' },
    ],
    fetchCountries: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('AgenciesPage', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(AgenciesPage, {
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

    // renders 2 agencies
    expect(bodyRows).toHaveLength(2);
    // check 1st row content
    // name
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent(testAgencies[0].name);
    // email
    expect(within(bodyRows[0]).getAllByRole('cell')[1]).toHaveTextContent(
      testAgencies[0].email ?? ''
    );
    // phones
    expect(within(bodyRows[0]).getAllByRole('cell')[2]).toHaveTextContent(
      testAgencies[0].phones && testAgencies[0].phones.length > 0
        ? testAgencies[0].phones[0].number
        : ''
    );
    // country
    expect(within(bodyRows[0]).getAllByRole('cell')[3]).toHaveTextContent(
      testAgencies[0].country?.name ?? ''
    );
    // check 2nd row content
    // name
    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent(testAgencies[1].name);
    // email
    expect(within(bodyRows[1]).getAllByRole('cell')[1]).toHaveTextContent(
      testAgencies[1].email ?? ''
    );
    // phones
    expect(within(bodyRows[1]).getAllByRole('cell')[2].innerHTML).toContain(
      testAgencies[1].phones && testAgencies[1].phones.length > 0
        ? testAgencies[1].phones[0].number
        : ''
    );
    expect(within(bodyRows[1]).getAllByRole('cell')[2].innerHTML).toContain(
      testAgencies[1].phones && testAgencies[1].phones.length > 0
        ? testAgencies[1].phones[1].number
        : ''
    );
    // country
    expect(within(bodyRows[1]).getAllByRole('cell')[3]).toHaveTextContent(
      testAgencies[1].country?.name ?? ''
    );
  });

  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Globex');
    vi.advanceTimersByTime(300);

    const last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last && last[2]).toBe('Globex');

    vi.useRealTimers();
  });

  it('debounces global search (only one call)', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchAgencies.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Globex');

    expect(mockContactsStore.fetchAgencies).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(mockContactsStore.fetchAgencies).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('fires by maxWait even with continuous typing', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchAgencies.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'abc');
    vi.advanceTimersByTime(2900);
    await user.type(input, 'def');
    vi.advanceTimersByTime(200); // 3100 > maxWait

    expect(mockContactsStore.fetchAgencies).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('sort by name toggles and maps orderBy', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(nameHeader); // asc
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[7]).toBe('name');

    await userEvent.click(nameHeader); // desc
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[7]).toBe('-name');
  });

  it('sort by email toggles and maps orderBy', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(emailHeader); // asc
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[7]).toBe('email');

    await userEvent.click(emailHeader); // desc
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[7]).toBe('-email');
  });

  it('sort by country toggles and maps orderBy', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(countryHeader); // asc
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[7]).toBe('country');

    await userEvent.click(countryHeader); // desc
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[7]).toBe('-country');
  });

  it('filters by name (column filter + apply) & clear input after click clear button', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const nameInput = within(overlay).getByPlaceholderText(/search by name/i);
    await userEvent.type(nameInput, 'Globex');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last && last[3]).toBe('Globex');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last && last[3]).toBeUndefined();
  });

  it('filters by email (column filter + apply) & clears with clear button', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    const filterBtn = within(emailHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const emailInput = within(overlay).getByPlaceholderText(/search by email/i);
    await userEvent.type(emailInput, 'contact@globex.pt');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[4]).toBe('contact@globex.pt');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
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

    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[6]).toBe('555'); // phone index en fetchAgencies

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[6]).toBeUndefined();
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
    const spainOption = within(listbox).getByRole('option', { name: /spain/i });
    await userEvent.click(spainOption);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[5]).toEqual(['Spain']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[5]).toBeUndefined();
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
    const spainOption = within(listbox).getByRole('option', { name: /spain/i });
    const portugalOption = within(listbox).getByRole('option', { name: /portugal/i });
    await userEvent.click(spainOption);
    await userEvent.click(portugalOption);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    const last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[5]).toHaveLength(2);
    expect(last?.[5]).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });

  it('applies all filters + global search and clears everything with "Clear all" button', async () => {
    mockContactsStore.fetchAgencies.mockClear();

    // Global search
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await userEvent.type(globalInput, 'Agency');

    // Name
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(within(nameHeader).getByRole('button'));
    const nameOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'Globex');
    await userEvent.click(within(nameOverlay).getByRole('button', { name: /apply/i }));

    // Email
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(within(emailHeader).getByRole('button'));
    const emailOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(
      within(emailOverlay).getByPlaceholderText(/search by email/i),
      'contact@globex.pt'
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
    await userEvent.click(within(listboxCountry).getByRole('option', { name: /spain/i }));
    await userEvent.click(within(countryOverlay).getByRole('button', { name: /apply/i }));

    // sort by country desc
    await userEvent.click(countryHeader); // asc
    await userEvent.click(countryHeader); // desc

    // Verify last call has all filters set (indexes para fetchAgencies)
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('Agency'); // global
    expect(last?.[3]).toBe('Globex'); // name
    expect(last?.[4]).toBe('contact@globex.pt'); // email
    expect(last?.[5]).toEqual(['Spain']); // countries
    expect(last?.[6]).toBe('555'); // phone
    expect(last?.[7]).toBe('-country'); // orderBy

    // Clear all (header button con label "Clear")
    const clearAllBtn = screen.getByRole('button', { name: /^clear$/i });
    await userEvent.click(clearAllBtn);

    // Todo limpio
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBeUndefined(); // global
    expect(last?.[3]).toBeUndefined(); // name
    expect(last?.[4]).toBeUndefined(); // email
    expect(last?.[5]).toBeUndefined(); // countries
    expect(last?.[6]).toBeUndefined(); // phone
    expect(last?.[7]).toBeUndefined(); // orderBy

    expect(globalInput).toHaveValue('');
  });
});
