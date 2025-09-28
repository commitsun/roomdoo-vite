import { describe, it, expect, vi, beforeEach } from 'vitest';

// Spies
const routerInstall = vi.fn();
const legacyInstall = vi.fn();
const i18nInstall = vi.fn();
const primevueInstall = vi.fn();
const toastInstall = vi.fn();
const dialogInstall = vi.fn();
const headInstall = vi.fn();

// Router mock: install + stub RouterView/RouterLink so Vue resolves them
vi.mock('@/infrastructure/plugins/router', () => ({
  default: {
    install(app: any) {
      routerInstall();
      app.component('RouterView', {
        name: 'RouterView',
        template: '<div data-test="router-view-stub" />',
      });
      app.component('RouterLink', {
        name: 'RouterLink',
        props: ['to'],
        template: '<a data-test="router-link-stub"><slot/></a>',
      });
    },
  },
}));

vi.mock('@/_legacy/store', () => ({ store: { install: legacyInstall } }));
vi.mock('@/infrastructure/plugins/i18n', () => ({ i18n: { install: i18nInstall } }));
vi.mock('@/infrastructure/plugins/primevue', () => ({ default: { install: primevueInstall } }));
vi.mock('primevue/dialogservice', () => ({ default: { install: dialogInstall } }));

// Keep ONLY ONE mock for toastservice, and let it actually provide the injection
vi.mock('primevue/toastservice', async () => {
  const mod: any = await vi.importActual('primevue/toastservice');
  return {
    default: {
      ...mod.default,
      install(app: any, ...rest: any[]) {
        toastInstall(app, ...rest); // spy
        return mod.default.install(app, ...rest); // real provide
      },
    },
  };
});

// If your real App.vue calls useToast() during mount and you still see "No PrimeVue Toast provided!"
// you can optionally stub useToast (harmless for a smoke test):
// vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: vi.fn(), removeGroup: vi.fn(), removeAllGroups: vi.fn() }) }));

// IMPORTANT: match EXACT specifier used by main.ts (it uses './App.vue')
vi.mock('./App.vue', () => ({
  default: { name: 'App', template: '<div data-test="mounted">App OK</div>' },
}));

// CSS mocks (dedupe the duplicate line)
vi.mock('@/ui/assets/style.css', () => ({}));
vi.mock('primeicons/primeicons.css', () => ({}));

// Head factory
vi.mock('@vueuse/head', () => ({
  createHead: () => ({ install: headInstall }),
}));

describe('bootstrap (main.ts)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('mounts the app and installs all plugins', async () => {
    await import('./main');

    const root = document.querySelector('#app')!;
    expect(root).toBeTruthy();

    expect(routerInstall).toHaveBeenCalledTimes(1);
    expect(legacyInstall).toHaveBeenCalledTimes(1);
    expect(i18nInstall).toHaveBeenCalledTimes(1);
    expect(primevueInstall).toHaveBeenCalledTimes(1);
    expect(dialogInstall).toHaveBeenCalledTimes(1);
    expect(toastInstall).toHaveBeenCalledTimes(1);
    expect(headInstall).toHaveBeenCalledTimes(1);
  });
});
