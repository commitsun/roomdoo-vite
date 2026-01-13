import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@testing-library/vue';
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
import ToggleSwitch from 'primevue/toggleswitch';

import SharedContactList from './SharedContactList.vue';

import type { Supplier, Customer, Agency, Guest, Contact } from '@/domain/entities/Contact';
import primevuePlugin from '@/infrastructure/plugins/primevue';

// Test data
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

const testCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    vat: 'US123456789',
    phones: [],
    country: { code: 'US', name: 'United States', id: 1 },
    totalInvoiced: 1500,
    image: '',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    vat: 'CA987654321',
    phones: [{ number: '555-123-4567', type: 'mobile' }],
    country: { code: 'CA', name: 'Canada', id: 2 },
    totalInvoiced: 2500,
    image: '',
  },
];

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

// Mock stores
const mockContactsStore = {
  suppliers: testSuppliers,
  suppliersCount: testSuppliers.length,
  fetchSuppliers: vi.fn().mockResolvedValue(undefined),
  customers: testCustomers,
  customersCount: testCustomers.length,
  fetchCustomers: vi.fn().mockResolvedValue(undefined),
  agencies: testAgencies,
  agenciesCount: testAgencies.length,
  fetchAgencies: vi.fn().mockResolvedValue(undefined),
  guests: testGuests,
  guestsCount: testGuests.length,
  fetchGuests: vi.fn().mockResolvedValue(undefined),
  contacts: testContacts,
  contactsCount: testContacts.length,
  fetchContacts: vi.fn().mockResolvedValue(undefined),
};

// Common mocks at top level
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
    'contacts.searchByCountry': 'Select countries',
    'contacts.searchByDocument': 'Search by document',
    'contacts.searchByType': 'Search by type',
    'contacts.n_countries_selected': '{count} selected',
    'contacts.detail': 'Contact detail',
    'contacts.cancel': 'Cancel',
    'contacts.document': 'Document',
    'contacts.lastReservation': 'Last reservation',
    'contacts.internalNotes': 'Internal notes',
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
    'contacts.type': 'Type',
    'contacts.types.customer': 'Customer',
    'contacts.types.supplier': 'Supplier',
    'contacts.types.agency': 'Agency',
    'contacts.types.guest': 'Guest',
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

vi.mock('@/infrastructure/stores/pmsProperties', () => ({
  usePmsPropertiesStore: () => ({
    currentPmsPropertyId: 'prop-1',
    pmsProperties: [{ id: 'prop-1', currency: { code: 'EUR' } }],
  }),
}));

vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading: vi.fn(), stopLoading: vi.fn() }),
}));

vi.mock('@/infrastructure/plugins/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'es-ES' },
    },
  },
}));

vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => mockContactsStore,
}));

vi.mock('@/infrastructure/stores/countries', () => ({
  useCountriesStore: () => ({
    countries: [
      { id: 1, name: 'Spain', code: 'ES' },
      { id: 2, name: 'Portugal', code: 'PT' },
      { id: 3, name: 'United States', code: 'US' },
      { id: 4, name: 'Canada', code: 'CA' },
    ],
    fetchCountries: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('SharedContactList', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Supplier type', () => {
    beforeEach(() => {
      const pinia = createTestingPinia();
      render(SharedContactList, {
        props: {
          type: 'supplier',
          isLoadingPage: false,
          total: testSuppliers.length,
          contacts: testSuppliers,
          fetchAction: mockContactsStore.fetchSuppliers,
        },
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

    it('renders suppliers with VAT and totalInvoiced', async () => {
      const first = testSuppliers[0];
      const second = testSuppliers[1];
      const rowGroups = screen.getAllByRole('rowgroup');
      const tbody = rowGroups[1];
      const bodyRows = within(tbody).getAllByRole('row');

      expect(bodyRows).toHaveLength(2);

      expect(bodyRows[0]).toHaveTextContent(first.name);
      expect(bodyRows[0]).toHaveTextContent(first.vat);
      expect(bodyRows[0]).toHaveTextContent(first.email ?? '');
      first.phones?.forEach((phone) => {
        expect(bodyRows[0]).toHaveTextContent(phone.number);
      });
      expect(bodyRows[0]).toHaveTextContent(first.country?.name ?? '');

      expect(bodyRows[1]).toHaveTextContent(second.name);
      expect(bodyRows[1]).toHaveTextContent(second.email ?? '');
      expect(bodyRows[1]).toHaveTextContent(second.vat);
      second.phones?.forEach((phone) => {
        expect(bodyRows[1]).toHaveTextContent(phone.number);
      });
      expect(bodyRows[1]).toHaveTextContent(second.country?.name ?? '');
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
  });

  describe('Customer type', () => {
    beforeEach(() => {
      const pinia = createTestingPinia();
      render(SharedContactList, {
        props: {
          type: 'customer',
          isLoadingPage: false,
          total: testCustomers.length,
          contacts: testCustomers,
          fetchAction: mockContactsStore.fetchCustomers,
        },
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

    it('renders customers with VAT and totalInvoiced', async () => {
      const first = testCustomers[0];
      const second = testCustomers[1];

      const rowGroups = screen.getAllByRole('rowgroup');
      const tbody = rowGroups[1];
      const bodyRows = within(tbody).getAllByRole('row');

      expect(bodyRows).toHaveLength(2);

      expect(bodyRows[0]).toHaveTextContent(first.name);
      expect(bodyRows[0]).toHaveTextContent(first.vat);
      expect(bodyRows[0]).toHaveTextContent(first.email ?? '');
      expect(bodyRows[0]).toHaveTextContent(first.country?.name ?? '');
      first.phones?.forEach((phone) => {
        expect(bodyRows[0]).toHaveTextContent(phone.number);
      });

      expect(bodyRows[1]).toHaveTextContent(second.name);
      expect(bodyRows[1]).toHaveTextContent(second.vat);
      expect(bodyRows[1]).toHaveTextContent(second.email ?? '');
      expect(bodyRows[1]).toHaveTextContent(second.country?.name ?? '');
      second.phones?.forEach((phone) => {
        expect(bodyRows[1]).toHaveTextContent(phone.number);
      });

      expect(mockContactsStore.fetchCustomers).toHaveBeenCalledTimes(1);
    });

    it('filters by VAT and clears with Clear', async () => {
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
      expect(last && last[1].vatContains).toBe('US123456789');

      const clearBtn = within(overlay).getByRole('button', { name: /Cancel/i });
      await userEvent.click(clearBtn);
      last = mockContactsStore.fetchCustomers.mock.calls.at(-1);
      expect(last && last[1].vatContains).toBeUndefined();
    });
  });

  describe('Agency type', () => {
    beforeEach(() => {
      const pinia = createTestingPinia();
      render(SharedContactList, {
        props: {
          total: testAgencies.length,
          type: 'agency',
          contacts: testAgencies,
          isLoadingPage: false,
          fetchAction: mockContactsStore.fetchAgencies,
        },
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

    it('renders agencies without VAT', async () => {
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
  });

  describe('Guest type', () => {
    beforeEach(() => {
      const pinia = createTestingPinia();
      render(SharedContactList, {
        props: {
          type: 'guest',
          total: testGuests.length,
          isLoadingPage: false,
          contacts: testGuests,
          fetchAction: mockContactsStore.fetchGuests,
        },
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

    it('renders guests with identification documents', async () => {
      const first = testGuests[0];
      const second = testGuests[1];
      const rowGroups = screen.getAllByRole('rowgroup');
      const tbody = rowGroups[1];
      const bodyRows = within(tbody).getAllByRole('row');

      expect(bodyRows).toHaveLength(2);

      const formatFirstDoc = (docs: Array<{ type: string; number: string }>): string => {
        const d0 = docs[0];
        const prefix = d0.type.substring(0, 3).toUpperCase();
        const dot = d0.type.length > 3 ? '.' : '';
        return `${prefix}${dot}${d0.number}`;
      };

      expect(bodyRows[0]).toHaveTextContent(first.name);

      const firstDocs = first.identificationDocuments ?? [];
      if (firstDocs.length > 0) {
        expect(bodyRows[0]).toHaveTextContent(formatFirstDoc(firstDocs as any));
      }
      if (firstDocs.length > 1) {
        expect(bodyRows[0]).toHaveTextContent(`+${firstDocs.length - 1}`);
      }
      expect(bodyRows[0]).toHaveTextContent(first.country?.name ?? '');

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

    it('filters by document and clears with Clear', async () => {
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
  });

  describe('Contact type', () => {
    beforeEach(() => {
      const pinia = createTestingPinia();
      render(SharedContactList, {
        props: {
          total: testContacts.length,
          isLoadingPage: false,
          contacts: testContacts,
          type: 'contact',
          fetchAction: mockContactsStore.fetchContacts,
        },
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

    it('renders contacts with types', async () => {
      const first = testContacts[0];
      const second = testContacts[1];

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
      first.types?.forEach((type) => {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        expect(bodyRows[0]).toHaveTextContent(label);
      });

      expect(bodyRows[1]).toHaveTextContent(second.name);
      expect(bodyRows[1]).toHaveTextContent(second.email ?? '');
      expect(bodyRows[1]).toHaveTextContent(second.country?.name ?? '');
      second.phones?.forEach((phone) => {
        expect(bodyRows[1]).toHaveTextContent(phone.number);
      });
      second.types?.forEach((type) => {
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        expect(bodyRows[1]).toHaveTextContent(label);
      });
    });

    it('filters by type and clears type filter', async () => {
      const typeHeader = screen.getByRole('columnheader', { name: /type/i });
      const filterBtn = within(typeHeader).getByRole('button');
      await userEvent.click(filterBtn);

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

      let last = mockContactsStore.fetchContacts.mock.calls.at(-1);
      expect(last?.[1].typeIn).toEqual(['supplier']);

      await userEvent.click(filterBtn);
      const overlay2 =
        (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
      const clearBtn = within(overlay2).getByRole('button', { name: /Cancel/i });
      await userEvent.click(clearBtn);

      last = mockContactsStore.fetchContacts.mock.calls.at(-1);
      expect(last?.[1].typeIn).toBeUndefined();
    });
  });

  describe('Common functionality', () => {
    beforeEach(() => {
      const pinia = createTestingPinia();
      render(SharedContactList, {
        props: {
          type: 'supplier',
          isLoadingPage: false,
          total: testSuppliers.length,
          contacts: testSuppliers,
          fetchAction: mockContactsStore.fetchSuppliers,
        },
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
      vi.advanceTimersByTime(200);
      expect(mockContactsStore.fetchSuppliers).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('sort by name toggles and maps orderBy', async () => {
      const header = screen.getAllByRole('columnheader', { name: /full name/i })[0];
      await userEvent.click(header);
      let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[2]).toBe('name');

      await userEvent.click(header);
      last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[2]).toBe('-name');
    });

    it('sort by email toggles and maps orderBy', async () => {
      const header = screen.getByRole('columnheader', { name: /email/i });
      await userEvent.click(header);
      let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[2]).toBe('email');

      await userEvent.click(header);
      last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[2]).toBe('-email');
    });

    it('sort by country toggles and maps orderBy', async () => {
      const header = screen.getByRole('columnheader', { name: /country/i });
      await userEvent.click(header);
      let last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
      expect(last?.[2]).toBe('country');

      await userEvent.click(header);
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

      const globalInput = screen.getByPlaceholderText(/global search/i);
      await user.type(globalInput, 'global');
      vi.advanceTimersByTime(250);

      const nameHeader = screen.getAllByRole('columnheader', { name: /full name/i })[0];
      await user.click(within(nameHeader).getByRole('button'));
      const nameOverlay =
        (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
      await user.type(within(nameOverlay).getByPlaceholderText(/search by name/i), 'Acme');
      await user.click(within(nameOverlay).getByRole('button', { name: /apply/i }));

      const vatHeader = screen.getByRole('columnheader', { name: /vat/i });
      await user.click(within(vatHeader).getByRole('button'));
      const vatOverlay =
        (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
      await user.type(within(vatOverlay).getByPlaceholderText(/search by vat/i), 'ESB12345678');
      await user.click(within(vatOverlay).getByRole('button', { name: /apply/i }));

      const emailHeader = screen.getByRole('columnheader', { name: /email/i });
      await user.click(within(emailHeader).getByRole('button'));
      const emailOverlay =
        (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
      await user.type(
        within(emailOverlay).getByPlaceholderText(/search by email/i),
        'billing@acme.com',
      );
      await user.click(within(emailOverlay).getByRole('button', { name: /apply/i }));

      const phoneHeader = screen.getByRole('columnheader', { name: /phone/i });
      await user.click(within(phoneHeader).getByRole('button'));
      const phoneOverlay =
        (await screen.findByRole('dialog').catch(() => null)) ?? (await screen.findByRole('menu'));
      await user.type(within(phoneOverlay).getByPlaceholderText(/search by phone/i), '555');
      await user.click(within(phoneOverlay).getByRole('button', { name: /apply/i }));

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

      await user.click(countryHeader);
      await user.click(countryHeader);

      await waitFor(() => {
        const last = mockContactsStore.fetchSuppliers.mock.calls.at(-1);
        expect(last?.[1].globalSearch).toBe('global');
        expect(last?.[1].nameContains).toBe('Acme');
        expect(last?.[1].emailContains).toBe('billing@acme.com');
        expect(last?.[1].vatContains).toBe('ESB12345678');
        expect(last?.[1].countryIn).toEqual(['Spain']);
        expect(last?.[1].phonesContains).toBe('555');
        expect(last?.[2]).toBe('-country');
      });

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
});
