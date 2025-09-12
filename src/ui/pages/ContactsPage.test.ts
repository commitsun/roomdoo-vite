import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
import type { Contact } from '@/domain/entities/Contact';
import ContactsPage from './ContactsPage.vue';

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
  };
  return {
    useI18n: () => ({
      t: (k: string, params?: any) =>
        k === 'contacts.n_countries_selected' && params ? '' : tMap[k] ?? k,
    }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

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
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@gmail.com',
    phones: [],
    country: {
      code: 'PT',
      name: 'Portugal',
      id: 2,
    },
    types: ['supplier'],
  },
  {
    id: 3,
    name: 'Foo Bar',
    email: 'foobar@gmail.com',
    phones: [],
    country: {
      code: 'FR',
      name: 'France',
      id: 3,
    },
    types: ['agency'],
  },
  {
    id: 4,
    name: 'Alice Bar',
    email: 'alicebar@gmail.com',
    phones: [],
    country: {
      code: 'IT',
      name: 'Italy',
      id: 4,
    },
    types: ['guest'],
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

describe('ContactsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const pinia = createTestingPinia();
    render(ContactsPage, {
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
  afterEach(() => {
    vi.useRealTimers();
  });
  it('fetches on mount', () => {
    expect(mockContactsStore.fetchContacts).toHaveBeenCalled();
  });
  it('renders contacts by default - happy path', async () => {
    const rowGroups = screen.getAllByRole('rowgroup');
    const tbody = rowGroups[1];
    const bodyRows = within(tbody).getAllByRole('row');
    expect(bodyRows).toHaveLength(4);
    expect(within(bodyRows[0]).getAllByRole('cell')[0]).toHaveTextContent(testContacts[0].name);
    expect(within(bodyRows[0]).getAllByRole('cell')[1]).toHaveTextContent(testContacts[0].types[0]);
    expect(within(bodyRows[0]).getAllByRole('cell')[2]).toHaveTextContent(
      testContacts[0].email ?? ''
    );
    expect(within(bodyRows[0]).getAllByRole('cell')[3]).toHaveTextContent(
      testContacts[0].phones && testContacts[0].phones.length > 0 ? testContacts[0].phones[0] : ''
    );
    expect(within(bodyRows[0]).getAllByRole('cell')[4]).toHaveTextContent(
      testContacts[0].country?.name ?? ''
    );
    ///
    expect(within(bodyRows[1]).getAllByRole('cell')[0]).toHaveTextContent(testContacts[1].name);
    ///
    expect(within(bodyRows[2]).getAllByRole('cell')[0]).toHaveTextContent(testContacts[2].name);
    ///
    expect(within(bodyRows[3]).getAllByRole('cell')[0]).toHaveTextContent(testContacts[3].name);
    ///
  });
  it('applies global search input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByRole('textbox', { name: 'Global search' });
    mockContactsStore.fetchContacts.mockClear();

    await user.clear(input);
    await user.type(input, 'Doe');
    vi.advanceTimersByTime(300);

    expect(mockContactsStore.fetchContacts).toHaveBeenCalled();
    const last = mockContactsStore.fetchContacts.mock.calls.at(-1); // check last call args
    expect(last).toEqual([
      1, // page
      50, // rows
      'Doe', // globalQuery
      undefined, // name
      undefined, // email
      undefined, // type
      undefined, // countries
      undefined, // orderBy
    ]);
  });

  it('debounces global search (only one call)', async () => {
    const user = userEvent.setup({ delay: 0, advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByRole('textbox', { name: 'Global search' });
    mockContactsStore.fetchContacts.mockClear();
    await user.type(input, 'Doe');
    expect(mockContactsStore.fetchContacts).not.toHaveBeenCalled(); // Time has not yet passed → 0 calls
    vi.advanceTimersByTime(250); // debounce
    expect(mockContactsStore.fetchContacts).toHaveBeenCalledTimes(1); // fetchContacts called
  });
  it('fires by maxWait even with continuous typing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const input = screen.getByRole('textbox', { name: 'Global search' });
    mockContactsStore.fetchContacts.mockClear();

    await user.type(input, 'abc'); // continuous input
    vi.advanceTimersByTime(2900); // still not debounced, but close to maxWait
    await user.type(input, 'def');
    vi.advanceTimersByTime(200); // 2900 + 200 = 3100 > maxWait
    expect(mockContactsStore.fetchContacts).toHaveBeenCalledTimes(1);
  });
  it('sort by name toggles and maps orderBy', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchContacts.mockClear();
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });

    await user.click(nameHeader); // asc
    vi.advanceTimersByTime(300);
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[7]).toBe('name'); // orderBy asc
    // [page, rows, global, name, email, type, countries, orderBy]

    await user.click(nameHeader); // desc
    vi.advanceTimersByTime(300);
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last?.[7]).toBe('-name'); // orderBy desc
  });
  it('filters by name (column filter + apply)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchContacts.mockClear();
    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');

    await user.click(filterBtn);
    const filterOverlay = await screen.findByRole('dialog');
    const nameInput = within(filterOverlay).getByPlaceholderText(/search by name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane');
    const applyBtn = within(filterOverlay).getByRole('button', { name: /apply/i });
    await user.click(applyBtn);
    vi.advanceTimersByTime(300);
    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[3]).toBe('Jane'); // [page, rows, global, name, email, type, countries, orderBy]
  });
  it('clears the name filter from the column filter menu', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchContacts.mockClear();

    const nameHeader = screen.getByRole('columnheader', { name: /full name/i });
    const filterBtn = within(nameHeader).getByRole('button');
    await user.click(filterBtn);

    // overlay del filtro (dialog o menu según versión)
    let overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));

    const nameInput = within(overlay).getByPlaceholderText(/search by name/i);
    await user.type(nameInput, 'Jane');

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await user.click(clearBtn);

    vi.advanceTimersByTime(300);
    await user.click(filterBtn);
    overlay = screen.queryByRole('dialog') ?? screen.queryByRole('menu')!;

    const nameInputAfterClear = within(overlay).getByPlaceholderText(/search by name/i);
    expect(nameInputAfterClear).toHaveValue('');

    const last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[3]).toBeUndefined();
  });

  it('filters by type & clears type filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockContactsStore.fetchContacts.mockClear();

    const typeHeader = screen.getByRole('columnheader', { name: /type/i });
    const filterBtn = within(typeHeader).getByRole('button'); // icono del embudo
    await user.click(filterBtn);

    let overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));

    const trigger = within(overlay).queryByRole('combobox') ?? within(overlay).getByRole('button'); // fallback if  Select doesn't use combobox
    await user.click(trigger);

    const listbox = await screen.findByRole('listbox');
    const supplierOption = within(listbox).getByRole('option', { name: /supplier/i });
    await user.click(supplierOption);

    const applyBtn = within(overlay).getByRole('button', { name: /apply/i });
    await user.click(applyBtn);
    vi.advanceTimersByTime(300);

    let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[5]).toBe('supplier'); // [page, rows, global, name, email, type, countries, orderBy]

    await user.click(filterBtn);
    overlay =
      (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));

    const clearBtn = within(overlay).getByRole('button', { name: /clear/i });
    await user.click(clearBtn);
    vi.advanceTimersByTime(300);

    // type limpiado -> undefined
    last = mockContactsStore.fetchContacts.mock.calls.at(-1);
    expect(last && last[5]).toBeUndefined();
  });
});
