import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';

import Sidebar from './Sidebar.vue';

import primevuePlugin from '@/infrastructure/plugins/primevue';
import { useUserStore } from '@/infrastructure/stores/user';

// ---- mocks i18n ----
vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'sidebar.planning': 'planning',
    'sidebar.dashboard': 'dashboard',
    'sidebar.contacts.title': 'contacts section',
    'sidebar.options': 'options',
    'sidebar.settings': 'settings',
    'sidebar.logout': 'logout',
    'sidebar.reports': 'reports',
    'sidebar.reportsGroup': 'reports group',
    'sidebar.links': 'links',
    'sidebar.cashRegister': 'cash register',
    'sidebar.billing': 'billing',
  };
  const global = {
    locale: { value: 'en' },
    availableLocales: ['en', 'es'],
    t: (key: string) => tMap[key] ?? key,
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

// ---- mocks legacy store ----
vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({ removeVuexAndOldCookiesUser: vi.fn() }),
}));

// ---- mock dialog composable ----
const openDialog = vi.fn();
vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ openDialog }),
}));

// ---- mock user store ----
vi.mock('@/infrastructure/stores/user', () => {
  const userStoreMock = {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.png',
    },
    logout: vi.fn(),
  };

  return {
    useUserStore: () => userStoreMock,
  };
});

// ---- mock pmsProperties store ----
vi.mock('@/infrastructure/stores/pmsProperties', () => {
  const pmsPropertiesStoreMock = {
    pmsProperties: [{ id: 1, name: 'Hotel Test', image: 'https://example.com/bg.jpg' }],
    currentPmsPropertyId: 1,
    pmsPropertyLinks: [
      {
        id: 10,
        label: 'Support link',
        isSupportLink: true,
        isReportLink: false,
      },
      {
        id: 20,
        label: 'External reports',
        isSupportLink: false,
        isReportLink: true,
      },
      {
        id: 30,
        label: 'External link',
        isSupportLink: false,
        isReportLink: false,
      },
    ],
    fetchPmsPropertyLink: vi.fn().mockResolvedValue('https://example.com'),
  };
  return { usePmsPropertiesStore: () => pmsPropertiesStoreMock };
});

// ---- router ----
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/:pmsPropertyId?', name: 'dashboard-id', component: { template: '<div />' } },
    { path: '/planning', name: 'planning', component: { template: '<div />' } },
    { path: '/planning/:pmsPropertyId?', name: 'planning-id', component: { template: '<div />' } },
    { path: '/contacts', name: 'contacts', component: { template: '<div />' } },
    { path: '/contacts/:pmsPropertyId?', name: 'contacts-id', component: { template: '<div />' } },
    { path: '/login', name: 'login', component: { template: '<div />' } },
    { path: '/transactions', name: 'transactions', component: { template: '<div />' } },
    {
      path: '/transactions/:pmsPropertyId?',
      name: 'transactions-id',
      component: { template: '<div />' },
    },
    { path: '/invoices', name: 'invoices', component: { template: '<div />' } },
    {
      path: '/invoices/:pmsPropertyId?',
      name: 'invoices-id',
      component: { template: '<div />' },
    },
  ],
});

let utils: ReturnType<typeof render>;

describe('Sidebar - navigation & behaviour', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    vi.clearAllMocks();

    utils = render(Sidebar, {
      global: {
        plugins: [pinia, router, [primevuePlugin, { ripple: false }]],
        stubs: {
          Avatar: { template: '<div />' },
          Select: { template: '<div />' },
        },
      },
      props: { menuOpen: true },
    });
  });

  it('marks Dashboard as active when route is /', async () => {
    await router.push('/');
    await router.isReady();

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    const planningLink = screen.getByRole('link', { name: /planning/i });
    expect(planningLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('marks Planning as active when route is /planning', async () => {
    await router.push('/planning');
    await router.isReady();

    const planningLink = screen.getByRole('link', { name: /planning/i });
    expect(planningLink).toBeInTheDocument();
    expect(planningLink).toHaveAttribute('aria-current', 'page');

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('marks Contacts as active when route is /contacts', async () => {
    await router.push('/contacts');
    await router.isReady();

    const contactsLink = screen.getByRole('link', { name: /contacts section/i });
    expect(contactsLink).toBeInTheDocument();
    expect(contactsLink).toHaveAttribute('aria-current', 'page');

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('applies open class on the sidebar when menuOpen is true', async () => {
    await router.push('/');
    await router.isReady();

    const sidebar = utils.container.querySelector('.sidebar') as HTMLElement;
    expect(sidebar).toHaveClass('is-open');
  });

  it('does not apply open class on the sidebar when menuOpen is false', async () => {
    await router.push('/');
    await router.isReady();

    await utils.rerender({ menuOpen: false });

    const sidebar = utils.container.querySelector('.sidebar') as HTMLElement;
    expect(sidebar).not.toHaveClass('is-open');
  });

  it('renders user info in the footer', async () => {
    await router.push('/');
    await router.isReady();

    const userStore = useUserStore();
    const { user = { firstName: '', lastName: '', email: '' } } = useUserStore();

    const fullName = `${user!.firstName} ${user!.lastName}`;

    expect(await screen.findByText(fullName)).toBeInTheDocument();
    expect(screen.getByText(userStore.user!.email)).toBeInTheDocument();
  });

  it('opens reports dialog when clicking Reports item in submenu', async () => {
    await router.push('/');
    await router.isReady();

    // abrir grupo de reports
    const reportsGroupToggle = await screen.findByText(/reports group/i);
    await fireEvent.click(reportsGroupToggle);

    // hacer click en la opción "reports" del submenu (Generar informes)
    const reportsItem = await screen.findByText(/^reports$/i);
    await fireEvent.click(reportsItem);

    await waitFor(() => {
      expect(openDialog).toHaveBeenCalledTimes(1);
    });
  });
});
