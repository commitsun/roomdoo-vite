import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import primevuePlugin from '@/infrastructure/plugins/primevue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ToggleSwitch from 'primevue/toggleswitch';
import CountryFlag from 'vue-country-flag-next';

import type { Guest } from '@/domain/entities/Contact';
import GuestsPage from './GuestsPage.vue';

// i18n mock (todas las keys que usa tu template)
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.globalSearch': 'Global search',
    'contacts.clear': 'Clear',
    'contacts.fullName': 'Full name',
    'contacts.document': 'Document',
    'contacts.country': 'Country',
    'contacts.lastReservation': 'Last reservation',
    'contacts.internalNotes': 'Internal notes',
    'contacts.searchByName': 'Search by name',
    'contacts.searchByDocument': 'Search by document',
    'contacts.selectCountries': 'Select countries',
  };
  return {
    useI18n: () => ({
      t: (k: string, params?: any) =>
        k === 'contacts.n_countries_selected' && params ? '' : tMap[k] ?? k,
    }),
    createI18n: vi.fn(() => ({ install: () => {} })),
  };
});

// Legacy & dialog
vi.mock('@/_legacy/components/partners/PartnerForm.vue', () => ({
  default: { name: 'PartnerForm', template: '<div />' },
}));
vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({
    fetchAndSetVuexPartnerAndACtiveProperty: vi.fn().mockResolvedValue(undefined),
  }),
}));
vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ open: vi.fn() }),
}));

// Stores
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading: vi.fn(), stopLoading: vi.fn() }),
}));
vi.mock('@/infrastructure/stores/pmsProperties', () => ({
  usePmsPropertiesStore: () => ({ currentPmsPropertyId: 1 }),
}));

const testGuests: Guest[] = [
  {
    id: 1,
    name: 'Alice Walker',
    email: 'alice@example.com',
    country: { code: 'ES', name: 'Spain', id: 1 },
    documents: [
      { type: 'Passport', number: 'X1234567' } as any,
      { type: 'ID', number: '12345678Z' } as any,
    ],
    inHouse: true,
    internalNotes: 'VIP guest. Allergic to peanuts.',
  },
  {
    id: 2,
    name: 'Bob Martin',
    email: 'bob@example.com',
    country: { code: 'PT', name: 'Portugal', id: 2 },
    documents: [{ type: 'Passport', number: 'P7654321' } as any],
    inHouse: false,
    internalNotes: 'Prefers late checkout.',
  },
];

const mockContactsStore = {
  guests: testGuests,
  contactsCount: testGuests.length,
  fetchGuests: vi.fn().mockResolvedValue(undefined),
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

describe('GuestsPage', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(GuestsPage, {
      global: {
        plugins: [pinia, [primevuePlugin, { ripple: false }]],
        components: {
          DataTable,
          Column,
          InputText,
          MultiSelect,
          Button,
          IconField,
          InputIcon,
          ToggleSwitch,
          CountryFlag,
        },
      },
    });
  });

  it('renders guests by default - happy path - fetches on mount', async () => {
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');
    expect(bodyRows).toHaveLength(2);

    // Row 1
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent('Alice Walker'); // name
    expect(within(bodyRows[0]).getAllByRole('cell')[1]).toHaveTextContent('Passport X1234567'); // document
    expect(within(bodyRows[0]).getAllByRole('cell')[1]).toHaveTextContent('+1'); // more docs
    expect(within(bodyRows[0]).getAllByRole('cell')[2]).toHaveTextContent('Spain'); // country
    expect(within(bodyRows[0]).getAllByRole('cell')[4]).toHaveTextContent('VIP guest.'); // notes
    expect(within(bodyRows[0]).getAllByRole('cell')[5].innerHTML).toContain('pi pi-home'); // inhouse icon

    // Row 2
    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent('Bob Martin');
    expect(within(bodyRows[1]).getAllByRole('cell')[1]).toHaveTextContent('Passport P7654321');
    expect(within(bodyRows[1]).getAllByRole('cell')[2]).toHaveTextContent('Portugal');
    expect(within(bodyRows[1]).getAllByRole('cell')[4]).toHaveTextContent('late checkout');
    expect(within(bodyRows[1]).getAllByRole('cell')[5].innerHTML).not.toContain('pi pi-home');
  });

  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Alice');
    vi.advanceTimersByTime(300);

    const last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[2]).toBe('Alice');

    vi.useRealTimers();
  });

  it('debounces global search (only one call)', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchGuests.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Ali');

    expect(mockContactsStore.fetchGuests).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(mockContactsStore.fetchGuests).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('fires by maxWait even with continuous typing', async () => {
    vi.useFakeTimers();
    mockContactsStore.fetchGuests.mockClear();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'abc');
    vi.advanceTimersByTime(2900);
    await user.type(input, 'def');
    vi.advanceTimersByTime(200);

    expect(mockContactsStore.fetchGuests).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('sort by name toggles and maps orderBy', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(nameHeader); // asc
    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[7]).toBe('name');

    await userEvent.click(nameHeader); // desc
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[7]).toBe('-name');
  });

  it('sort by country toggles and maps orderBy', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(countryHeader); // asc
    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[7]).toBe('country');

    await userEvent.click(countryHeader); // desc
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[7]).toBe('-country');
  });

  it('filters by name (column filter + apply) & clears with clear button', async () => {
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const nameInput = within(overlay).getByPlaceholderText(/search by name/i);
    await userEvent.type(nameInput, 'Alice');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[3]).toBe('Alice');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[3]).toBeUndefined();
  });

  it('filters by document (column filter + apply) & clears with clear button', async () => {
    const docHeader = screen.getByRole('columnheader', { name: /document/i });
    const filterBtn = within(docHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const docInput = within(overlay).getByPlaceholderText(/search by document/i);
    await userEvent.type(docInput, 'X1234567');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[4]).toBe('X1234567');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[4]).toBeUndefined();
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
    const spain = within(listbox).getByRole('option', { name: /spain/i });
    await userEvent.click(spain);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[5]).toEqual(['Spain']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
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
    const spain = within(listbox).getByRole('option', { name: /spain/i });
    const portugal = within(listbox).getByRole('option', { name: /portugal/i });
    await userEvent.click(spain);
    await userEvent.click(portugal);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    const last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[5]).toHaveLength(2);
    expect(last?.[5]).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });

  it('toggles Inhouse and maps to fetchGuests arg', async () => {
    const toggle = screen.getByLabelText(/in-house/i);
    await userEvent.click(toggle);

    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[6]).toBe(true);

    await userEvent.click(toggle);
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[6]).toBeUndefined();
  });

  it('applies all filters + global search and clears everything with "Clear" button', async () => {
    mockContactsStore.fetchGuests.mockClear();

    // Global
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await userEvent.type(globalInput, 'ali');

    // Name
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(within(nameHeader).getByRole('button'));
    const nameOv =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(nameOv).getByPlaceholderText(/search by name/i), 'Alice');
    await userEvent.click(within(nameOv).getByRole('button', { name: /apply/i }));

    // Document
    const docHeader = screen.getByRole('columnheader', { name: /document/i });
    await userEvent.click(within(docHeader).getByRole('button'));
    const docOv =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(docOv).getByPlaceholderText(/search by document/i), 'X1234567');
    await userEvent.click(within(docOv).getByRole('button', { name: /apply/i }));

    // Country
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(within(countryHeader).getByRole('button'));
    const countryOv =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(countryOv).queryByRole('combobox', { name: /select countries/i }) ??
      within(countryOv).getByText(/select countries/i);
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: /spain/i }));
    await userEvent.click(within(countryOv).getByRole('button', { name: /apply/i }));

    // Inhouse ON
    const toggle = screen.getByLabelText(/in-house/i);
    await userEvent.click(toggle);

    // Sort country desc
    await userEvent.click(countryHeader); // asc
    await userEvent.click(countryHeader); // desc

    // Check all applied
    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[2]).toBe('ali'); // global
    expect(last?.[3]).toBe('Alice'); // name
    expect(last?.[4]).toBe('X1234567'); // documents
    expect(last?.[5]).toEqual(['Spain']); // countries
    expect(last?.[6]).toBe(true); // inhouseOnly
    expect(last?.[7]).toBe('-country'); // orderBy

    // Clear all
    const clearBtn = screen.getByRole('button', { name: /^clear$/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[2]).toBeUndefined();
    expect(last?.[3]).toBeUndefined();
    expect(last?.[4]).toBeUndefined();
    expect(last?.[5]).toBeUndefined();
    expect(last?.[6]).toBeUndefined();
    expect(last?.[7]).toBeUndefined();

    expect(globalInput).toHaveValue('');
  });
});
