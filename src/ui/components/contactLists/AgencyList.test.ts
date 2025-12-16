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

import AgencyList from './AgencyList.vue';

import type { Agency } from '@/domain/entities/Contact';
import primevuePlugin from '@/infrastructure/plugins/primevue';
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
    'contacts.searchByCountry': 'Select countries',
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
      locale: { value: 'es-ES' },
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
// test data agencies
const testAgencies: Agency[] = [
  {
    id: 1,
    name: 'Acme Travel',
    email: 'booking@acme.com',
    phones: [],
    country: { code: 'ES', name: 'Spain', id: 1 },
    image: '',
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
    image: '',
  },
];
const mockContactsStore = {
  agencies: testAgencies,
  agenciesCount: testAgencies.length,
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
describe('AgencyList', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(AgencyList, {
      props: { total: testAgencies.length },
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
    const first = testAgencies[0];
    const second = testAgencies[1];
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]).toHaveTextContent(first.name);
    expect(bodyRows[0]).toHaveTextContent(first.email ?? '');
    expect(bodyRows[0]).toHaveTextContent(first.country?.name ?? '');
    first.phones?.forEach((phone) => {
      expect(bodyRows[0]).toHaveTextContent(phone.number);
    });
    expect(bodyRows[1]).toHaveTextContent(second.name);
    expect(bodyRows[1]).toHaveTextContent(second.email ?? '');
    expect(bodyRows[1]).toHaveTextContent(second.country?.name ?? '');
    second.phones?.forEach((phone) => {
      expect(bodyRows[1]).toHaveTextContent(phone.number);
    });
  });
  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Globex');
    vi.advanceTimersByTime(300);

    const last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last && last[1].globalSearch).toBe('Globex');

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
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    await userEvent.click(nameHeader); // asc
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('name');

    await userEvent.click(nameHeader); // desc
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('-name');
  });
  it('sort by email toggles and maps orderBy', async () => {
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(emailHeader); // asc
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('email');

    await userEvent.click(emailHeader); // desc
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('-email');
  });
  it('sort by country toggles and maps orderBy', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(countryHeader); // asc
    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('country');

    await userEvent.click(countryHeader); // desc
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[2]).toBe('-country');
  });
  it('filters by name (column filter + apply) & clear input after click clear button', async () => {
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const nameInput = within(overlay).getByPlaceholderText(/search by name/i);
    await userEvent.type(nameInput, 'Globex');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBe('Globex');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBeUndefined();
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
    expect(last?.[1].emailContains).toBe('contact@globex.pt');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[1].emailContains).toBeUndefined();
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
    expect(last?.[1].phonesContains).toBe('555'); // phone index en fetchAgencies

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[1].phonesContains).toBeUndefined();
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
    expect(last?.[1].countryIn).toEqual(['Spain']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
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
    const spainOption = within(listbox).getByRole('option', { name: /spain/i });
    const portugalOption = within(listbox).getByRole('option', { name: /portugal/i });
    await userEvent.click(spainOption);
    await userEvent.click(portugalOption);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    const last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
    expect(last?.[1].countryIn).toHaveLength(2);
    expect(last?.[1].countryIn).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });
  it('applies all filters + global search and clears everything with "Clear all" buttons', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchAgencies.mockClear();
    // Global search (debounced)
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await user.type(globalInput, 'Agency');
    // fires debounce (250ms) with margin
    vi.advanceTimersByTime(300);
    // Name
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    await user.click(within(nameHeader).getByRole('button'));
    const nameOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'Globex');
    await user.click(within(nameOverlay).getByRole('button', { name: /apply/i }));
    // Email
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await user.click(within(emailHeader).getByRole('button'));
    const emailOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(
      within(emailOverlay).getByPlaceholderText(/search by email/i),
      'contact@globex.pt',
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
    const countryTrigger =
      within(countryOverlay).queryByRole('combobox', { name: /select countries/i }) ??
      within(countryOverlay).getByText(/select countries/i);
    await user.click(countryTrigger);
    const listboxCountry = await screen.findByRole('listbox');
    await user.click(within(listboxCountry).getByRole('option', { name: /spain/i }));
    await user.click(within(countryOverlay).getByRole('button', { name: /apply/i }));
    // sort by country
    await user.click(countryHeader); // asc
    await user.click(countryHeader); // desc
    // Assert in a stable way: wait for a call with ALL the expected params
    await waitFor(() => {
      const calls = mockContactsStore.fetchAgencies.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const last = calls.at(-1);
      expect(last?.[1].globalSearch).toBe('Agency');
      expect(last?.[1].nameContains).toBe('Globex');
      expect(last?.[1].emailContains).toBe('contact@globex.pt');
      expect(last?.[1].countryIn).toEqual(['Spain']);
      expect(last?.[1].phonesContains).toBe('555');
      expect(last?.[2]).toBe('-country');
    });
    // Clear all (header button)
    const clearAllBtn = await screen.findByRole('button', { name: /clear global search/i });
    await user.click(clearAllBtn);
    // Assert everything is cleared
    await waitFor(() => {
      const last = mockContactsStore.fetchAgencies.mock.calls.at(-1);
      expect(last?.[1].globalSearch).toBeUndefined();
      expect(last?.[1].nameContains).toBeUndefined();
      expect(last?.[1].emailContains).toBeUndefined();
      expect(last?.[1].countryIn).toBeUndefined();
      expect(last?.[1].phonesContains).toBeUndefined();
      expect(last?.[2]).toBeUndefined();
      expect(globalInput).toHaveValue('');
      vi.useRealTimers();
    });
  });
});
