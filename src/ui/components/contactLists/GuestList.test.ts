import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ToggleSwitch from 'primevue/toggleswitch';
import CountryFlag from 'vue-country-flag-next';

import GuestList from './GuestList.vue';

import type { Guest } from '@/domain/entities/Contact';
import primevuePlugin from '@/infrastructure/plugins/primevue';
// i18n mock
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
    'contacts.searchByCountry': 'Select countries',
    'contacts.allGuests': 'All guests',
    'contacts.inHouseGuests': 'In-house guests',
    'contacts.datePicker.placeHolder': 'Select dates',
    'contacts.datePicker.presetRanges': 'Preset ranges',
    'contacts.datePicker.today': 'Today',
    'contacts.datePicker.last7Days': 'Last 7 days',
    'contacts.datePicker.last30Days': 'Last 30 days',
    'contacts.datePicker.thisMonth': 'This month',
    'contacts.datePicker.clear': 'Clear',
    'contacts.datePicker.apply': 'Apply',
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
vi.mock('@/infrastructure/plugins/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'es-ES' },
    },
  },
}));
// Legacy & dialog
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
// UI store mock
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading: vi.fn(), stopLoading: vi.fn() }),
}));
// pmsProperties store mock
vi.mock('@/infrastructure/stores/pmsProperties', () => ({
  usePmsPropertiesStore: () => ({ currentPmsPropertyId: 1 }),
}));
// test data
const testGuests: Guest[] = [
  {
    id: 1,
    name: 'Alice Walker',
    email: 'alice@example.com',
    country: { code: 'ES', name: 'Spain', id: 1 },
    identificationDocuments: [
      { type: 'Passport', number: 'X1234567' } as any,
      { type: 'ID', number: '12345678Z' } as any,
    ],
    lastReservationDate: new Date('2023-08-15T12:00:00Z'),
    lastReservation: { id: 101, name: 'RES123' },
    inHouse: true,
    internalNotes: 'VIP guest. Allergic to peanuts.',
    image: 'https://example.com/alice.jpg',
  },
  {
    id: 2,
    name: 'Bob Martin',
    email: 'bob@example.com',
    country: { code: 'PT', name: 'Portugal', id: 2 },
    identificationDocuments: [{ type: 'Passport', number: 'P7654321' } as any],
    lastReservationDate: new Date('2023-08-15T12:00:00Z'),
    lastReservation: { id: 102, name: 'RES456' },
    inHouse: false,
    internalNotes: 'Prefers late checkout.',
    image: 'https://example.com/bob.jpg',
  },
];
// Contacts store mock
const mockContactsStore = {
  guests: testGuests,
  guestsCount: testGuests.length,
  fetchGuests: vi.fn().mockResolvedValue(undefined),
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
describe('GuestList', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(GuestList, {
      props: { total: testGuests.length },
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
    const first = testGuests[0];
    const second = testGuests[1];
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');
    // rendered 2 guests
    expect(bodyRows).toHaveLength(2);
    // Helper: UI renders only the FIRST doc + "+N" when there are more
    const formatFirstDoc = (docs: Array<{ type: string; number: string }>): string => {
      const d0 = docs[0];
      const prefix = d0.type.substring(0, 3).toUpperCase();
      const dot = d0.type.length > 3 ? '.' : '';
      return `${prefix}${dot}${d0.number}`;
    };
    // first row
    expect(bodyRows[0]).toHaveTextContent(first.name);

    const firstDocs = first.identificationDocuments ?? [];
    if (firstDocs.length > 0) {
      expect(bodyRows[0]).toHaveTextContent(formatFirstDoc(firstDocs as any));
    }
    if (firstDocs.length > 1) {
      expect(bodyRows[0]).toHaveTextContent(`+${firstDocs.length - 1}`);
    }
    expect(bodyRows[0]).toHaveTextContent(first.country?.name ?? '');
    // Row 2
    expect(bodyRows[1]).toHaveTextContent(second.name);
    const secondDocs = second.identificationDocuments ?? [];
    if (secondDocs.length > 0) {
      expect(bodyRows[1]).toHaveTextContent(formatFirstDoc(secondDocs as any));
    }
    if (secondDocs.length > 1) {
      expect(bodyRows[1]).toHaveTextContent(`+${secondDocs.length - 1}`);
    }
    expect(bodyRows[1]).toHaveTextContent(second.country?.name ?? '');
  });
  it('applies global search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByPlaceholderText(/global search/i);
    await user.type(input, 'Alice');
    vi.advanceTimersByTime(300);

    const last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[1].globalSearch).toBe('Alice');

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
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    await userEvent.click(nameHeader); // asc
    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[2]).toBe('name');

    await userEvent.click(nameHeader); // desc
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[2]).toBe('-name');
  });
  it('sort by country toggles and maps orderBy', async () => {
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(countryHeader); // asc
    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[2]).toBe('country');

    await userEvent.click(countryHeader); // desc
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[2]).toBe('-country');
  });
  it('filters by name (column filter + apply) & clears with clear button', async () => {
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const nameInput = within(overlay).getByPlaceholderText(/search by name/i);
    await userEvent.type(nameInput, 'Alice');
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    let last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBe('Alice');

    const clearBtn = within(overlay).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);
    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBeUndefined();
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
    expect(last && last[1].documentContains).toBe('X1234567');

    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last && last[1].documentContains).toBeUndefined();
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
    expect(last?.[1].countryIn).toEqual(['Spain']);

    // clear
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /Cancel/i });
    await userEvent.click(clearBtn);

    last = mockContactsStore.fetchGuests.mock.calls.at(-1);
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

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    const last = mockContactsStore.fetchGuests.mock.calls.at(-1);
    expect(last?.[1].countryIn).toHaveLength(2);
    expect(last?.[1].countryIn).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });
  it('applies all filters + global search and clears everything with "Clear" button', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchGuests.mockClear();
    // Global search (debounced)
    const globalInput = screen.getByPlaceholderText(/global search/i);
    await user.type(globalInput, 'ali');
    // fires debounce (250ms) with margin
    vi.advanceTimersByTime(300);
    // Name
    const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
    await user.click(within(nameHeader).getByRole('button'));
    const nameOv =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(within(nameOv).getByPlaceholderText(/search by name/i), 'Alice');
    await user.click(within(nameOv).getByRole('button', { name: /apply/i }));
    // Document
    const docHeader = screen.getByRole('columnheader', { name: /document/i });
    await user.click(within(docHeader).getByRole('button'));
    const docOv =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.type(within(docOv).getByPlaceholderText(/search by document/i), 'X1234567');
    await user.click(within(docOv).getByRole('button', { name: /apply/i }));
    // Country
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await user.click(within(countryHeader).getByRole('button'));
    const countryOv =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(countryOv).queryByRole('combobox', { name: /select countries/i }) ??
      within(countryOv).getByText(/select countries/i);
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: /spain/i }));
    await user.click(within(countryOv).getByRole('button', { name: /apply/i }));
    // Date (last reservation)
    const dateInputs = screen.getAllByPlaceholderText(/select dates/i);
    await user.click(dateInputs[0]);
    const dpOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await user.click(within(dpOverlay).getByRole('button', { name: /last 7 days/i }));
    await user.click(within(dpOverlay).getByRole('button', { name: /apply/i }));
    // In-house Select
    const inHouseTrigger =
      screen.queryByRole('combobox', { name: /All guests/i }) ||
      screen.queryByRole('combobox') ||
      screen.getByText(/All guests/i);
    await user.click(inHouseTrigger);
    const inHouseListbox =
      (await screen.findByRole('listbox').catch(() => null)) ?? (await screen.findByRole('menu'));
    const inHouseOption = within(inHouseListbox).getByRole('option', {
      name: /In-house guests/i,
    });
    await user.click(inHouseOption);
    // Sort country
    await user.click(countryHeader); // asc
    await user.click(countryHeader); // desc
    // Check all applied
    await waitFor(() => {
      const last = mockContactsStore.fetchGuests.mock.calls.at(-1);
      expect(last?.[1].globalSearch).toBe('ali'); // global
      expect(last?.[1].nameContains).toBe('Alice'); // name
      expect(last?.[1].documentContains).toBe('X1234567'); // documents
      expect(last?.[1].countryIn).toEqual(['Spain']); // countries
      expect(last?.[1].checkinDateFrom).toBeInstanceOf(Date); // date from
      expect(last?.[1].checkinDateTo).toBeInstanceOf(Date); // date to
      const msPerDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(
        (last?.[1].checkinDateTo.getTime() - last?.[1].checkinDateFrom.getTime()) / msPerDay,
      );
      // range "Last 7 days" -> 6 days difference (from today-6 to today), we allow 6–7 due to TZ
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(7);
      expect(last?.[1].inHouseOnly).toBe(true); // in-house
      expect(last?.[2]).toBe('-country'); // orderBy
    });
    // Clear all
    const clearAllBtn = screen.getByRole('button', { name: /clear global search/i });
    await user.click(clearAllBtn);
    // Assert everything is cleared
    await waitFor(() => {
      const last = mockContactsStore.fetchGuests.mock.calls.at(-1);
      expect(last?.[1].globalSearch).toBeUndefined();
      expect(last?.[1].nameContains).toBeUndefined();
      expect(last?.[1].documentContains).toBeUndefined();
      expect(last?.[1].countryIn).toBeUndefined();
      expect(last?.[1].checkinDateFrom).toBeUndefined();
      expect(last?.[1].checkinDateTo).toBeUndefined();
      expect(last?.[1].inHouseOnly).toBeUndefined();
      expect(last?.[2]).toBeUndefined();
      expect(globalInput).toHaveValue('');
      vi.useRealTimers();
    });
  });
});
