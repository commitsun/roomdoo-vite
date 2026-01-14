import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Badge from 'primevue/badge';
import { Users, UserCheck, BedDouble, Store, Package } from 'lucide-vue-next';

import ContactsAllPage from '@/ui/pages/ContactsAllPage.vue';
import primevuePlugin from '@/infrastructure/plugins/primevue';

class RO {
  constructor(_cb?: (...args: any[]) => void) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', RO);

vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'contacts.title': 'Contacts',
    'contacts.new': 'New',
    'contacts.all': 'All',
    'contacts.customers': 'Customers',
    'contacts.guests': 'Guests',
    'contacts.agencies': 'Agencies',
    'contacts.suppliers': 'Suppliers',
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ install: () => {} })),
  };
});

vi.mock('primevue/usedialog', () => {
  return {
    useDialog: () => ({
      open: vi.fn(),
    }),
  };
});

vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
  }),
}));

vi.mock('@/infrastructure/stores/user', () => ({
  useUserStore: () => ({
    user: { lang: 'es-ES' },
  }),
}));

const fetchContacts = vi.fn().mockResolvedValue(undefined);
const fetchAgencies = vi.fn().mockResolvedValue(undefined);
const fetchCustomers = vi.fn().mockResolvedValue(undefined);
const fetchGuests = vi.fn().mockResolvedValue(undefined);
const fetchSuppliers = vi.fn().mockResolvedValue(undefined);

vi.mock('@/infrastructure/stores/contacts', () => ({
  useContactsStore: () => ({
    contactsCount: 1234,
    customersCount: 56,
    guestsCount: 7890,
    agenciesCount: 12,
    suppliersCount: 3,
    fetchContacts,
    fetchAgencies,
    fetchCustomers,
    fetchGuests,
    fetchSuppliers,
  }),
}));

describe('ContactsAllPage (tabs)', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    render(ContactsAllPage, {
      global: {
        plugins: [pinia, [primevuePlugin, { ripple: false }]],
        components: {
          Button,
          Tabs,
          TabList,
          Tab,
          TabPanel,
          TabPanels,
          Badge,
          Users,
          UserCheck,
          BedDouble,
          Store,
          Package,
        },
        stubs: {
          ContactList: { template: '<div />' },
        },
      },
    });
  });

  it('renders header title and "New" button', async () => {
    expect(await screen.findByText('Contacts')).toBeTruthy();
    expect(screen.getByText('New')).toBeTruthy();
  });

  it('renders 5 tabs with i18n labels', () => {
    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Customers')).toBeTruthy();
    expect(screen.getByText('Guests')).toBeTruthy();
    expect(screen.getByText('Agencies')).toBeTruthy();
    expect(screen.getByText('Suppliers')).toBeTruthy();
  });

  it('shows compact numbers (locale-aware) in badges', async () => {
    expect(await screen.findByText(/1,2K/)).toBeTruthy();
    expect(screen.getByText('56')).toBeTruthy();
    expect(screen.getByText(/7,9K/)).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});
