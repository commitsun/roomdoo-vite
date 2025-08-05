import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Select from 'primevue/select';
import { createTestingPinia } from '@pinia/testing';
import router from '@/ui/plugins/router';

const pushMock = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  };
});

vi.mock('@/ui/plugins/i18n', async () => {
  const { createI18n } = await import('vue-i18n');
  const en = (await import('@/infrastructure/locales/en.json')).default;

  const SUPPORTED_LOCALES = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
  ];

  return {
    i18n: createI18n({
      legacy: false,
      locale: 'en',
      globalInjection: true,
      messages: { en },
    }),
    SUPPORTED_LOCALES,
    updateI18nAvailableLocales: (languages?: Array<{ code: string }>) => {
      if (!languages || languages.length === 0) return SUPPORTED_LOCALES;
      const codes = languages.map((l) => l.code.split('_')[0]);
      return SUPPORTED_LOCALES.filter((locale) => codes.includes(locale.value));
    },
  };
});

vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading: vi.fn(), stopLoading: vi.fn() }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('LoginLayout.vue', () => {
  const getGlobalConfig = async () => {
    const { i18n } = await import('@/ui/plugins/i18n');
    return {
      global: {
        plugins: [
          PrimeVue,
          router,
          i18n,
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
          }),
        ],
        components: {
          Select,
        },
      },
    };
  };

  it('redirects to hotel-not-found if fetchInstance fails', async () => {
    vi.doMock('@/infrastructure/stores/instance', () => ({
      useInstanceStore: () => ({
        fetchInstance: vi.fn().mockRejectedValue(new Error('Server error')),
        instance: null,
      }),
    }));

    const { default: LoginLayout } = await import('./LoginLayout.vue');
    const globalConfig = await getGlobalConfig();
    mount(LoginLayout, globalConfig);
    await new Promise((resolve) => setImmediate(resolve));

    expect(pushMock).toHaveBeenCalledWith({ name: 'hotel-not-found' });
  });

  it('shows language selector if more than one locale is available', async () => {
    vi.doMock('@/infrastructure/stores/instance', () => ({
      useInstanceStore: () => ({
        fetchInstance: vi.fn().mockResolvedValue(undefined),
        instance: {
          image: '',
          languages: [{ code: 'en' }, { code: 'es' }],
        },
      }),
    }));

    const { default: LoginLayout } = await import('./LoginLayout.vue');
    const globalConfig = await getGlobalConfig();
    const wrapper = mount(LoginLayout, globalConfig);
    await new Promise((resolve) => setImmediate(resolve));

    expect(wrapper.find('.select-language').exists()).toBe(true);
  });

  it('does not show language selector if only one locale is available', async () => {
    vi.doMock('@/infrastructure/stores/instance', () => ({
      useInstanceStore: () => ({
        fetchInstance: vi.fn().mockResolvedValue(undefined),
        instance: {
          image: '',
          languages: [{ code: 'en' }],
        },
      }),
    }));

    const { default: LoginLayout } = await import('./LoginLayout.vue');
    const globalConfig = await getGlobalConfig();
    const wrapper = mount(LoginLayout, globalConfig);
    await new Promise((resolve) => setImmediate(resolve));

    expect(wrapper.find('.select-language').exists()).toBe(false);
  });
});
