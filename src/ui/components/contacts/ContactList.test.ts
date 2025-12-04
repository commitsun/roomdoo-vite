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

import ContactList from './ContactList.vue';

import type { Contact } from '@/domain/entities/Contact';
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
    'contacts.type': 'Type',
    'contacts.searchByName': 'Search by name',
    'contacts.searchByEmail': 'Search by email',
    'contacts.searchByType': 'Search by type',
    'contacts.searchByCountry': 'Search by country',
    'contacts.n_countries_selected': '{count} selected',
    'contacts.types.customer': 'Customer',
    'contacts.types.supplier': 'Supplier',
    'contacts.types.agency': 'Agency',
    'contacts.types.guest': 'Guest',
  };
  const i18nGlobal = {
    locale: { value: 'en' },
  };
  return {
    useI18n: () => ({
      t: (k: string, params?: any) =>
        k === 'contacts.n_countries_selected' && params !== undefined && params !== null
          ? ''
          : (tMap[k] ?? k),
    }),
    createI18n: vi.fn(() => ({
      global: i18nGlobal,
      install: () => {},
    })),
  };
});

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

// test data contacts
const testContacts: Contact[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@mail.com',
    phones: [],
    country: {
      code: 'ES',
      name: 'Spain',
      id: 1,
    },
    types: ['customer'],
    image: '',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@gmail.com',
    phones: [
      { number: '555-123-4567', type: 'mobile' },
      { number: '555-987-6543', type: 'phone' },
    ],
    country: {
      code: 'PT',
      name: 'Portugal',
      id: 2,
    },
    types: ['supplier', 'guest'],
    image: '',
  },
];

const mockContactsStore = {
  contacts: testContacts,
  contactsCount: testContacts.length,
  fetchContacts: vi.fn().mockResolvedValue(undefined),
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

describe('ContactList', () => {
  beforeEach(() => {
    // create pinia for testing
    const pinia = createTestingPinia();
    // render component
    render(ContactList, {
      props: { total: testContacts.length, isLoadingPage: false },
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

  it('renders contacts by default - happy path - fetches on mount', async () => {
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');

    const first = testContacts[0];
    const second = testContacts[1];
    const firstPhones = first.phones ?? [];
    const secondPhones = second.phones ?? [];

    // renders 2 contacts
    expect(bodyRows).toHaveLength(2);

    // name
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent(first.name);
    // types
    expect(within(bodyRows[0]).getAllByRole('cell')[1].innerHTML).toContain(
      first.types[0].charAt(0).toUpperCase() + first.types[0].slice(1),
    );
    // email
    expect(within(bodyRows[0]).getAllByRole('cell')[2]).toHaveTextContent(first.email ?? '');
    // phones
    expect(within(bodyRows[0]).getAllByRole('cell')[3]).toHaveTextContent(
      firstPhones.length > 0 ? firstPhones[0].number : '',
    );
    // country
    expect(within(bodyRows[0]).getAllByRole('cell')[4]).toHaveTextContent(
      first.country?.name ?? '',
    );

    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent(second.name);
    // types
    expect(within(bodyRows[1]).getAllByRole('cell')[1].innerHTML).toContain(
      second.types[0].charAt(0).toUpperCase() + second.types[0].slice(1),
    );
    expect(within(bodyRows[1]).getAllByRole('cell')[1].innerHTML).toContain(
      second.types[1].charAt(0).toUpperCase() + second.types[1].slice(1),
    );
    // email
    expect(within(bodyRows[1]).getAllByRole('cell')[2]).toHaveTextContent(second.email ?? '');
    // phones
    expect(within(bodyRows[1]).getAllByRole('cell')[3].innerHTML).toContain(
      secondPhones.length > 0 ? secondPhones[0].number : '',
    );
    expect(within(bodyRows[1]).getAllByRole('cell')[3].innerHTML).toContain(
      secondPhones.length > 1 ? secondPhones[1].number : '',
    );
    // country
    expect(within(bodyRows[1]).getAllByRole('cell')[4]).toHaveTextContent(
      second.country?.name ?? '',
    );
  });

  it('applies global search input', async () => {
    // start fake timers
    vi.useFakeTimers();
    // set up user events
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // get global search input and type 'Doe'
    const input = screen.getByRole('textbox', { name: 'Global search' });
    await user.type(input, 'Doe');

    // wait for debounce
    vi.advanceTimersByTime(300);

    // fetchContacts should have been called with 'Doe' as globalSearch arg
    const last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[1].globalSearch).toBe('Doe');

    // restore real timers
    vi.useRealTimers();
  });
  it('debounces global search (only one call)', async () => {
    // start fake timers
    vi.useFakeTimers();
    // reset fetchContacts mock calls
    mockContactsStore.fetchContacts.mockClear();
    // set up user events
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // get global search input and type 'Doe'
    const input = screen.getByRole('textbox', { name: 'Global search' });
    await user.type(input, 'Doe');

    // should not have been called yet (debounce 300ms + maxWait 3000ms)
    expect(mockContactsStore.fetchContacts).not.toHaveBeenCalled(); // Time has not yet passed → 0 calls

    // advance time 250ms
    vi.advanceTimersByTime(250);

    // should have been called
    expect(mockContactsStore.fetchContacts).toHaveBeenCalledTimes(1);

    // restore real timers
    vi.useRealTimers();
  });
  it('fires by maxWait even with continuous typing', async () => {
    // start fake timers
    vi.useFakeTimers();
    // reset fetchContacts mock calls
    mockContactsStore.fetchContacts.mockClear();
    // set up user events
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // get global search input and type 'abc' + 'def' with 2900ms delay between them (maxWait=3000)
    const input = screen.getByRole('textbox', { name: 'Global search' });
    await user.type(input, 'abc'); // continuous input
    vi.advanceTimersByTime(2900); // still not debounced, but close to maxWait
    await user.type(input, 'def');
    vi.advanceTimersByTime(200); // 2900 + 200 = 3100 > maxWait

    // should not have been called twice, but only once (maxWait)
    expect(mockContactsStore.fetchContacts).toHaveBeenCalledTimes(1);

    // restore real timers
    vi.useRealTimers();
  });
  it('sort by name toggles and maps orderBy', async () => {
    // get name header & click (sort)
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(nameHeader); // asc

    // get last call to fetchContacts and check orderBy arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);

    expect(last?.[2]).toBe('name'); // orderBy asc

    // click again
    await userEvent.click(nameHeader); // desc

    // get last call to fetchContacts and check orderBy arg
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[2]).toBe('-name'); // orderBy desc
  });
  it('sort by email toggles and maps orderby', async () => {
    // get name header & click (sort)
    const nameHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(nameHeader); // asc

    // get last call to fetchContacts and check orderBy arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[2]).toBe('email'); // orderBy asc

    // click again
    await userEvent.click(nameHeader); // desc

    // get last call to fetchContacts and check orderBy arg
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[2]).toBe('-email'); // orderBy desc
  });
  it('sort by country toggles and maps orderby', async () => {
    // get name header & click (sort)
    const nameHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(nameHeader); // asc

    // get last call to fetchContacts and check orderBy arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[2]).toBe('country'); // orderBy asc

    // click again
    await userEvent.click(nameHeader); // desc

    // get last call to fetchContacts and check orderBy arg
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[2]).toBe('-country'); // orderBy desc
  });
  it('filters by name (column filter + apply) & clear input after click clear button', async () => {
    // get column filter button & click
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, fill name input, click apply
    const filterOverlay = await screen.findByRole('dialog');
    const nameInput = within(filterOverlay).getByPlaceholderText(/search by name/i);
    await userEvent.type(nameInput, 'Jane');
    const applyBtn = within(filterOverlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check name arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBe('Jane'); // [page, rows, global, name, email, type, countries, orderBy]

    // open filter again and click clear button
    const clearBtn = within(filterOverlay).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    // get last call to fetchContacts and check name arg is cleared
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[1].nameContains).toBeUndefined();
  });
  it('filters by type & clears type filter', async () => {
    // get type header filter button & click
    const typeHeader = screen.getByRole('columnheader', { name: /type/i });
    const filterBtn = within(typeHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, select type, click apply
    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(overlay).queryByRole('combobox', { name: /search by type/i }) ??
      within(overlay).getByText(/search by type/i);
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    const supplierOption = within(listbox).getByRole('option', { name: /supplier/i });
    await userEvent.click(supplierOption);
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check type arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].typeIn).toEqual(['supplier']);

    // open filter again and click clear button
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    // get last call to fetchContacts and check type arg is cleared
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].typeIn).toBeUndefined();
  });

  it('filters by several types', async () => {
    // get type header filter button & click
    const typeHeader = screen.getByRole('columnheader', { name: /type/i });
    const filterBtn = within(typeHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, select type, click apply
    const overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(overlay).queryByRole('combobox', { name: /search by type/i }) ??
      within(overlay).getByText(/search by type/i);
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    const supplierOption = within(listbox).getByRole('option', { name: /supplier/i });
    await userEvent.click(supplierOption);
    const guestOption = within(listbox).getByRole('option', { name: /guest/i });
    await userEvent.click(guestOption);
    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check type arg
    const last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].typeIn).toHaveLength(2);
    expect(last?.[1].typeIn).toEqual(expect.arrayContaining(['guest', 'supplier']));
  });
  it('filters by email (column filter + apply) & clears with clear button', async () => {
    // get email header filter button & click
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    const filterBtn = within(emailHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, fill email input, click apply
    const overlay1 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const emailInput = within(overlay1).getByPlaceholderText(/search by email/i);
    await userEvent.type(emailInput, 'john@mail.com');
    const applyBtn = within(overlay1).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check email arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].emailContains).toBe('john@mail.com');

    // open filter again and click clear button
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    // get last call to fetchContacts and check email arg is cleared
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].emailContains).toBeUndefined();
  });
  it('filters by phone (column filter + apply) & clears with clear button', async () => {
    // get phone header filter button & click
    const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
    const filterBtn = within(phoneHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, fill phone input, click apply
    const overlay1 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const phoneInput = within(overlay1).getByPlaceholderText(/search by phone/i);
    await userEvent.type(phoneInput, '555');
    const applyBtn = within(overlay1).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check phone arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].phonesContains).toBe('555');

    // open filter again and click clear button
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    // get last call to fetchContacts and check phone arg is cleared
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].phonesContains).toBeUndefined();
  });
  it('filters by country & clears country filter', async () => {
    // get country header filter button & click
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    const filterBtn = within(countryHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, select country, click apply
    const overlay1 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(overlay1).queryByRole('combobox', { name: /search by country/i }) ??
      within(overlay1).getByText(/search by country/i);
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    const spainOption = within(listbox).getByRole('option', { name: /spain/i });
    await userEvent.click(spainOption);
    const applyBtn = within(overlay1).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check country arg
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].countryIn).toEqual(['Spain']);

    // open filter again and click clear button
    await userEvent.click(filterBtn);
    const overlay2 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const clearBtn = within(overlay2).getByRole('button', { name: /clear/i });
    await userEvent.click(clearBtn);

    // get last call to fetchContacts and check country arg is cleared
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].countryIn).toBeUndefined();
  });
  it('filters by several countries', async () => {
    // get country header filter button & click
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    const filterBtn = within(countryHeader).getByRole('button');
    await userEvent.click(filterBtn);

    // get dialog, select country, click apply
    const overlay1 =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const trigger =
      within(overlay1).queryByRole('combobox', { name: /search by country/i }) ??
      within(overlay1).getByText(/search by country/i);
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    const spainOption = within(listbox).getByRole('option', { name: /spain/i });
    await userEvent.click(spainOption);
    const portugaloption = within(listbox).getByRole('option', { name: /portugal/i });
    await userEvent.click(portugaloption);
    const applyBtn = within(overlay1).getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    // get last call to fetchContacts and check country arg
    const last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].countryIn).toHaveLength(2);
    expect(last?.[1].countryIn).toEqual(expect.arrayContaining(['Spain', 'Portugal']));
  });
  it('applies all filters + global search and clears everything with "Clear all" button', async () => {
    // clear mock
    mockContactsStore.fetchContacts.mockClear();

    // --- Global search ---
    const globalInput = screen.getByRole('textbox', { name: /global search/i });
    await userEvent.type(globalInput, 'Doe');

    // --- Name filter ---
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    await userEvent.click(within(nameHeader).getByRole('button'));
    const nameOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'Jane');
    await userEvent.click(within(nameOverlay).getByRole('button', { name: /apply/i }));

    // --- Email filter ---
    const emailHeader = screen.getByRole('columnheader', { name: /email/i });
    await userEvent.click(within(emailHeader).getByRole('button'));
    const emailOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(
      within(emailOverlay).getByPlaceholderText(/search by email/i),
      'john@mail.com',
    );
    await userEvent.click(within(emailOverlay).getByRole('button', { name: /apply/i }));

    // --- Phone filter ---
    const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
    await userEvent.click(within(phoneHeader).getByRole('button'));
    const phoneOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    await userEvent.type(within(phoneOverlay).getByPlaceholderText(/search by phone/i), '555');
    await userEvent.click(within(phoneOverlay).getByRole('button', { name: /apply/i }));

    // --- Type filter ---
    const typeHeader = screen.getByRole('columnheader', { name: /type/i });
    await userEvent.click(within(typeHeader).getByRole('button'));
    const typeOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const typeTrigger =
      within(typeOverlay).queryByRole('combobox', { name: /search by type/i }) ??
      within(typeOverlay).getByText(/search by type/i);
    await userEvent.click(typeTrigger);
    const listboxType = await screen.findByRole('listbox');
    await userEvent.click(within(listboxType).getByRole('option', { name: /customer/i }));
    await userEvent.click(within(typeOverlay).getByRole('button', { name: /apply/i }));

    // --- Country filter ---
    const countryHeader = screen.getByRole('columnheader', { name: /country/i });
    await userEvent.click(within(countryHeader).getByRole('button'));
    const countryOverlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
    const countryTrigger =
      within(countryOverlay).queryByRole('combobox', { name: /search by country/i }) ??
      within(countryOverlay).getByText(/search by country/i);
    await userEvent.click(countryTrigger);
    const listboxCountry = await screen.findByRole('listbox');
    await userEvent.click(within(listboxCountry).getByRole('option', { name: /spain/i }));
    await userEvent.click(within(countryOverlay).getByRole('button', { name: /apply/i }));

    // sort by country
    await userEvent.click(countryHeader); // asc
    await userEvent.click(countryHeader); // desc

    // --- Verify last call has all filters set ---
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].globalSearch).toBe('Doe'); // global search
    expect(last?.[1].nameContains).toBe('Jane'); // name filter
    expect(last?.[1].emailContains).toBe('john@mail.com'); // email filter
    expect(last?.[1].typeIn).toEqual(['customer']); // type filter
    expect(last?.[1].countryIn).toEqual(['Spain']); // country filter
    expect(last?.[1].phonesContains).toBe('555'); // phone filter
    expect(last?.[2]).toBe('-country'); // orderBy

    // --- Clear all ---
    const clearAllBtn = screen.getByRole('button', { name: /clear global search/i });
    await userEvent.click(clearAllBtn);

    // --- Verify last call after clear has everything undefined ---
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[1].globalSearch).toBeUndefined(); // global search cleared
    expect(last?.[1].nameContains).toBeUndefined(); // name filter cleared
    expect(last?.[1].emailContains).toBeUndefined(); // email filter cleared
    expect(last?.[1].typeIn).toBeUndefined(); // type filter cleared
    expect(last?.[1].countryIn).toBeUndefined(); // country filter cleared
    expect(last?.[1].phonesContains).toBeUndefined(); // phone filter cleared
    expect(last?.[2]).toBeUndefined(); // orderBy cleared

    // --- Global input must be empty ---
    expect(globalInput).toHaveValue('');
  });
});
