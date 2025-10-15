import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';

import Sidebar from './Sidebar.vue'; // ajusta si tu ruta real es distinta

import primevuePlugin from '@/infrastructure/plugins/primevue';
import { useUserStore } from '@/infrastructure/stores/user';

vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'sidebar.planning': 'planning',
    'sidebar.dashboard': 'dashboard',
    'sidebar.contacts.title': 'contacts section',
    'sidebar.contacts.all': 'all contacts',
    'sidebar.options': 'options',
    'sidebar.settings': 'settings',
    'sidebar.logout': 'logout',
    'sidebar.reports': 'reports',
    'sidebar.arrivals': 'arrivals',
    'sidebar.links': 'links',
  };
  const global = {
    locale: { value: 'en' },
    availableLocales: ['en', 'es'],
    t: (key: string, _params?: unknown) => tMap[key] ?? key,
  };
  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({ removeVuexAndOldCookiesUser: vi.fn() }),
}));
const open = vi.fn();
vi.mock('@/ui/composables/useAppDialog', () => ({
  useAppDialog: () => ({ open }),
}));

vi.mock('@/infrastructure/stores/user', () => {
  // Single store object reused by component and tests
  const userStoreMock = {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.png',
    },
    // This will be spied in the test with vi.spyOn(...)
    logout: vi.fn(),
  };

  return {
    useUserStore: () => userStoreMock,
  };
});

vi.mock('@/infrastructure/stores/pmsProperties', () => {
  // mutable mock so tests can tweak it if needed
  const pmsPropertiesStoreMock = {
    pmsProperties: [{ id: 1, name: 'Hotel Test', image: 'https://example.com/bg.jpg' }],
    currentPmsPropertyId: 1,
    pmsPropertyLinks: [],
    fetchPmsPropertyLink: vi.fn(),
  };
  return { usePmsPropertiesStore: () => pmsPropertiesStoreMock };
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    // Dashboard (con id opcional)
    { path: '/', name: 'dashboard', component: { template: '<div />' } },
    { path: '/:pmsPropertyId?', name: 'dashboard-id', component: { template: '<div />' } },

    // Planning (con id opcional)
    { path: '/planning', name: 'planning', component: { template: '<div />' } },
    { path: '/planning/:pmsPropertyId?', name: 'planning-id', component: { template: '<div />' } },

    // Contacts & derivados (con id opcional)
    { path: '/contacts', name: 'contacts', component: { template: '<div />' } },
    { path: '/contacts/:pmsPropertyId?', name: 'contacts-id', component: { template: '<div />' } },

    { path: '/customers', name: 'customers', component: { template: '<div />' } },
    {
      path: '/customers/:pmsPropertyId?',
      name: 'customers-id',
      component: { template: '<div />' },
    },

    { path: '/guests', name: 'guests', component: { template: '<div />' } },
    { path: '/guests/:pmsPropertyId?', name: 'guests-id', component: { template: '<div />' } },

    { path: '/agencies', name: 'agencies', component: { template: '<div />' } },
    { path: '/agencies/:pmsPropertyId?', name: 'agencies-id', component: { template: '<div />' } },

    { path: '/suppliers', name: 'suppliers', component: { template: '<div />' } },
    {
      path: '/suppliers/:pmsPropertyId?',
      name: 'suppliers-id',
      component: { template: '<div />' },
    },
    {
      path: '/login',
      name: 'login',
      component: { template: '<div />' },
    },

    // Transactions / Invoices (con id opcional)
    { path: '/transactions', name: 'transactions', component: { template: '<div />' } },
    {
      path: '/transactions/:pmsPropertyId?',
      name: 'transactions-id',
      component: { template: '<div />' },
    },

    { path: '/invoices', name: 'invoices', component: { template: '<div />' } },
    { path: '/invoices/:pmsPropertyId?', name: 'invoices-id', component: { template: '<div />' } },
  ],
});

let utils: ReturnType<typeof render>;

describe('Sidebar - navigation & active links', () => {
  beforeEach(() => {
    const pinia = createTestingPinia();
    utils = render(Sidebar, {
      global: {
        plugins: [pinia, router, [primevuePlugin, { ripple: false }]],
        stubs: {
          Avatar: { template: '<div/>' },
          LegacyReport: { template: '<div/>' },
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

  it('applies open class on the aside when menuOpen is true', async () => {
    await router.push('/');
    await router.isReady();

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('layout__sidebar--open');
  });

  it('expands Contacts submenu on mouseenter when current route is under /contacts', async () => {
    // Navigate to /contacts so the component considers the Contacts section active.
    await router.push('/contacts');
    await router.isReady();

    // Trigger the mouseenter handler on the sidebar to run checkPathAndExpandContacts().
    const aside = screen.getByRole('complementary');
    await fireEvent.mouseEnter(aside);

    // The Contacts toggle must be visible.
    const contactsToggle = screen.getByText(/contacts section/i);
    expect(contactsToggle).toBeInTheDocument();

    // The submenu should already be open when the route is /contacts.
    const contactsAll = screen.getByText(/all contacts/i);
    const submenu = contactsAll.closest('ul');
    expect(submenu).toHaveClass('layout__submenu--open');

    // The "all contacts" link should be marked as active.
    const contactsLink = contactsAll.closest('a');
    expect(contactsLink).toHaveClass('router-link-exact-active');
  });

  it('toggles Contacts submenu by click when not under /contacts', async () => {
    // Start on a non-contacts route so the submenu is initially closed.
    await router.push('/');
    await router.isReady();

    // The Contacts toggle must be visible.
    const contactsToggle = screen.getByText(/contacts section/i);
    expect(contactsToggle).toBeInTheDocument();

    // The submenu exists but should be closed at first.
    const contactsAll = screen.getByText(/all contacts/i);
    const submenu = contactsAll.closest('ul');
    expect(submenu).not.toHaveClass('layout__submenu--open');

    // Clicking the toggle should open the submenu.
    await fireEvent.click(contactsToggle);
    expect(submenu).toHaveClass('layout__submenu--open');

    // Clicking again should close it back.
    await fireEvent.click(contactsToggle);
    expect(submenu).not.toHaveClass('layout__submenu--open');
  });

  it('does not apply open class on the aside when menuOpen is false', async () => {
    // Navigate to a known route and wait for the router to be ready.
    await router.push('/');
    await router.isReady();
    await utils.rerender({ menuOpen: false });

    // The aside should not have the "open" class when menuOpen is false.
    const aside = screen.getByRole('complementary');
    expect(aside).not.toHaveClass('layout__sidebar--open');
  });

  it('opens user menu on user block click ', async () => {
    // Ensure we are on a known route and the router is ready.
    await router.push('/');
    await router.isReady();

    // Wait until the user block is in the DOM (email is a stable visible selector).
    const email = await screen.findByText('john@example.com');
    const userBlock = email.closest('.property__user') as HTMLElement;
    const userMenu = userBlock.querySelector('.property__user-menu') as HTMLElement;

    // Initially the menu should be closed (no "is-open" class).
    expect(userMenu).not.toHaveClass('is-open');

    // Clicking the user block toggles the menu open.
    await fireEvent.click(userBlock);
    expect(userMenu).toHaveClass('is-open');

    // Clicking outside (the aside) should hide the menu.
    const aside = screen.getByRole('complementary');
    await fireEvent.click(aside);
    expect(userMenu).not.toHaveClass('is-open');
  });

  it('calls logout from user store when clicking Logout', async () => {
    // Spy on the logout function before the test runs
    const userStore = useUserStore();
    const logoutSpy = vi.spyOn(userStore, 'logout');

    // Ensure we are on a known route and the router is ready
    await router.push('/');
    await router.isReady();

    // Open the sidebar (hover) so the footer area is interactable
    const aside = screen.getByRole('complementary');
    await fireEvent.mouseEnter(aside);

    // Open the user menu: click on the user block (email is a stable visible selector)
    const emailNode = await screen.findByText('john@example.com');
    await fireEvent.click(emailNode);

    // Click the "logout" menu item (PrimeVue Menu renders items as role="menuitem")
    const logoutItem = await screen.findByRole('menuitem', { name: /logout/i });
    const logoutAnchor = logoutItem.querySelector('a') as HTMLAnchorElement;
    await fireEvent.click(logoutAnchor);

    // // Assert asynchronously: the command callback runs, then we observe logout
    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('opens Reports submenu and launches "arrivals" report via dialog', async () => {
    await router.push('/');
    await router.isReady();

    const aside = screen.getByRole('complementary');
    await fireEvent.mouseEnter(aside);

    const reportsToggle = screen.getByText(/reports/i);
    expect(reportsToggle).toBeInTheDocument();
    await fireEvent.click(reportsToggle);
    const arrivalsItem = screen.getByText(/arrivals/i);
    await fireEvent.click(arrivalsItem);

    await waitFor(() => {
      expect(open).toHaveBeenCalled();
    });
  });
});
